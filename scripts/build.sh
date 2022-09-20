#!/bin/sh

. 'scripts/preamble.sh'

yarn install --frozen-lockfile
yarn run build