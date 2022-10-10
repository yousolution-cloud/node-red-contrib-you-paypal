# Unofficial Mailchimp API nodes for Node-RED.

[![Platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)

This module provides a set of nodes for Node-RED to quickly create integration flows with PayPal API.

# Installation

[![NPM](https://nodei.co/npm/node-red-contrib-you-sap-service-layer.png?downloads=true)](https://nodei.co/npm/node-red-contrib-you-sap-service-layer/)

You can install the nodes using node-red's "Manage palette" in the side bar.

Or run the following command in the root directory of your Node-RED installation

    npm install @yousolution/node-red-contrib-you-paypal --save

# Dependencies

The nodes are tested with `Node.js v12.22.6` and `Node-RED v2.0.6`.

- [axios](https://github.com/axios/axios)

# Changelog

Changes can be followed [here](/CHANGELOG.md).

# Usage

## Basics

### Authentication

To use this Paypal APIs, you need a PayPal's Developer account.
Into the category "My Apps & Credentials" get the Client ID and the Client Secret og the registered app you want to use.

### PayPal API (node apiPaypal)

Use this node to execute Marketing API

1. Select a Resource to work with
2. Select an Action to operate on this Resouce
3. Add required PathParams
4. To manage results, add optional QueryParams

You can see how to use it in the example flows in the _/examples_ directory.\
_For more details see official [PayPal Deleloper](https://developer.paypal.com/api/rest/)_
