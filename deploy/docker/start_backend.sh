#!/bin/bash

# Wait until RTS started and listens on port 8091
while [ -z "`curl localhost:8091/rts-api/v1/health-check`" ]; do
  echo 'Waiting for RTS to start ...'
  sleep 1
done
echo 'RTS started.'

# Start server.
echo 'Starting Backend server...'
/opt/appsmith/run-with-env.sh /opt/appsmith/run-java.sh
