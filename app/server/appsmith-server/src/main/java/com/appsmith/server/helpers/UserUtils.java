package com.appsmith.server.helpers;

import com.appsmith.external.models.Policy;
import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.constants.FieldName;
import com.appsmith.server.domains.Config;
import com.appsmith.server.domains.PermissionGroup;
import com.appsmith.server.domains.User;
import com.appsmith.server.dtos.Permission;
import com.appsmith.server.repositories.ConfigRepository;
import com.appsmith.server.repositories.PermissionGroupRepository;
import net.minidev.json.JSONObject;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static com.appsmith.server.acl.AclPermission.ASSIGN_PERMISSION_GROUPS;
import static com.appsmith.server.acl.AclPermission.MANAGE_INSTANCE_CONFIGURATION;
import static com.appsmith.server.acl.AclPermission.MANAGE_PERMISSION_GROUPS;
import static com.appsmith.server.acl.AclPermission.READ_INSTANCE_CONFIGURATION;
import static com.appsmith.server.constants.FieldName.DEFAULT_PERMISSION_GROUP;
import static com.appsmith.server.constants.FieldName.INSTANCE_CONFIG;

@Component
public class UserUtils {

    private final ConfigRepository configRepository;

    private final PermissionGroupRepository permissionGroupRepository;

    public UserUtils(ConfigRepository configRepository, PermissionGroupRepository permissionGroupRepository) {
        this.configRepository = configRepository;
        this.permissionGroupRepository = permissionGroupRepository;
    }

    public Mono<Boolean> isSuperUser(User user) {
        return configRepository.findByNameAsUser(INSTANCE_CONFIG, user, AclPermission.MANAGE_INSTANCE_CONFIGURATION)
                .map(config -> Boolean.TRUE)
                .switchIfEmpty(Mono.just(Boolean.FALSE));
    }

    public Mono<Boolean> isCurrentUserSuperUser() {
        return configRepository.findByName(INSTANCE_CONFIG, AclPermission.MANAGE_INSTANCE_CONFIGURATION)
                .map(config -> Boolean.TRUE)
                .switchIfEmpty(Mono.just(Boolean.FALSE));
    }

    public Mono<Boolean> makeSuperUser(List<User> users) {
        return configRepository.findByName(INSTANCE_CONFIG)
                .switchIfEmpty(createInstanceConfigForSuperUser())
                .flatMap(instanceConfig -> {
                    JSONObject config = instanceConfig.getConfig();
                    String defaultPermissionGroup = (String) config.getOrDefault(DEFAULT_PERMISSION_GROUP, "");
                    return permissionGroupRepository.findById(defaultPermissionGroup);
                })
                .flatMap(permissionGroup -> {
                    if (permissionGroup.getAssignedToUserIds() == null) {
                        permissionGroup.setAssignedToUserIds(new HashSet<>());
                    }
                    permissionGroup.getAssignedToUserIds().addAll(users.stream().map(User::getId).collect(Collectors.toList()));
                    return permissionGroupRepository.updateById(permissionGroup.getId(), permissionGroup, AclPermission.ASSIGN_PERMISSION_GROUPS);
                })
                .then(Mono.just(Boolean.TRUE));
    }

    public Mono<Boolean> removeSuperUser(List<User> users) {
        return configRepository.findByName(INSTANCE_CONFIG)
                .switchIfEmpty(createInstanceConfigForSuperUser())
                .flatMap(instanceConfig -> {
                    JSONObject config = instanceConfig.getConfig();
                    String defaultPermissionGroup = (String) config.getOrDefault(DEFAULT_PERMISSION_GROUP, "");
                    return permissionGroupRepository.findById(defaultPermissionGroup);
                })
                .flatMap(permissionGroup -> {
                    if (permissionGroup.getAssignedToUserIds() == null) {
                        permissionGroup.setAssignedToUserIds(new HashSet<>());
                    }
                    permissionGroup.getAssignedToUserIds().removeAll(users.stream().map(User::getId).collect(Collectors.toList()));
                    return permissionGroupRepository.updateById(permissionGroup.getId(), permissionGroup, AclPermission.ASSIGN_PERMISSION_GROUPS);
                })
                .then(Mono.just(Boolean.TRUE));
    }

    private Mono<Config> createInstanceConfigForSuperUser() {
        Config instanceAdminConfiguration = new Config();
        instanceAdminConfiguration.setName(FieldName.INSTANCE_CONFIG);

        return configRepository.save(instanceAdminConfiguration)
                .flatMap(savedInstanceConfig -> {
                    // Create instance management permission group
                    PermissionGroup instanceManagerPermissionGroup = new PermissionGroup();
                    instanceManagerPermissionGroup.setName(FieldName.INSTACE_ADMIN_ROLE);
                    instanceManagerPermissionGroup.setPermissions(
                            Set.of(
                                    new Permission(savedInstanceConfig.getId(), MANAGE_INSTANCE_CONFIGURATION)
                            )
                    );

                    return permissionGroupRepository.save(instanceManagerPermissionGroup)
                            .flatMap(savedPermissionGroup -> {

                                // Update the instance config with the permission group id
                                savedInstanceConfig.setConfig(
                                        new JSONObject(Map.of(DEFAULT_PERMISSION_GROUP, savedPermissionGroup.getId()))
                                );

                                Policy editConfigPolicy = Policy.builder().permission(MANAGE_INSTANCE_CONFIGURATION.getValue())
                                        .permissionGroups(Set.of(savedPermissionGroup.getId()))
                                        .build();
                                Policy readConfigPolicy = Policy.builder().permission(READ_INSTANCE_CONFIGURATION.getValue())
                                        .permissionGroups(Set.of(savedPermissionGroup.getId()))
                                        .build();

                                savedInstanceConfig.setPolicies(Set.of(editConfigPolicy, readConfigPolicy));

                                return configRepository.save(savedInstanceConfig).zipWith(Mono.just(savedPermissionGroup));
                            });
                })
                .flatMap(tuple -> {
                    Config finalInstanceConfig = tuple.getT1();
                    PermissionGroup savedPermissionGroup = tuple.getT2();

                    Set<Permission> permissions = new HashSet<>(savedPermissionGroup.getPermissions());
                    permissions.addAll(
                            Set.of(
                                    new Permission(savedPermissionGroup.getId(), MANAGE_PERMISSION_GROUPS),
                                    new Permission(savedPermissionGroup.getId(), ASSIGN_PERMISSION_GROUPS)
                            )
                    );
                    savedPermissionGroup.setPermissions(permissions);

                    // Also give the permission group permission to update & assign to itself
                    Policy updatePermissionGroupPolicy = Policy.builder().permission(MANAGE_PERMISSION_GROUPS.getValue())
                            .permissionGroups(Set.of(savedPermissionGroup.getId()))
                            .build();

                    Policy assignPermissionGroupPolicy = Policy.builder().permission(ASSIGN_PERMISSION_GROUPS.getValue())
                            .permissionGroups(Set.of(savedPermissionGroup.getId()))
                            .build();

                    savedPermissionGroup.setPolicies(Set.of(updatePermissionGroupPolicy, assignPermissionGroupPolicy));

                    return permissionGroupRepository.save(savedPermissionGroup).thenReturn(finalInstanceConfig);
                });
    }

}