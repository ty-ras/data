# Typesafe REST API Specification - Data Related Generic Libraries

[![CI Pipeline](https://github.com/ty-ras/data/actions/workflows/ci.yml/badge.svg)](https://github.com/ty-ras/data/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/ty-ras/data/actions/workflows/cd.yml/badge.svg)](https://github.com/ty-ras/data/actions/workflows/cd.yml)

The Typesafe REST API Specification is a family of libraries used to enable seamless development of Backend and/or Frontend which communicate via HTTP protocol.
The protocol specification is checked both at compile-time and run-time to verify that communication indeed adhers to the protocol.
This all is done in such way that it does not make development tedious or boring, but instead robust and fun!

This particular repository contains generic data validation related libraries, and is designed to be consumed by other TyRAS libraries:
- [data](./code/data) contains some core types and utility methods to handle data validation,
- [protocol](./code/protocol) contains protocol-related types for other libraries to build their own types on,
- [data-frontend](./code/data-frontend) contains types and utility methods to create callbacks to invoke backend endpoints from frontend, and
- [data-backend](./code/data-backend) contains types and utility methods to handle data validation on backend side.
