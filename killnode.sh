#!/bin/bash

PORT=3917
PROCESS=$(lsof -i :$PORT | awk '/NODE/ {print $2}')

if [[ -n "$PROCESS" ]]; then
  echo "Killing Node.js process $PROCESS using port $PORT"
  kill $PROCESS
else
  echo "No Node.js process found using port $PORT"
fi