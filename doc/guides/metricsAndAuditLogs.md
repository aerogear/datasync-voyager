# Displaying metrics and exploring audit logs

## Overview

Audit logging is a mechanism to track the actions. This is useful to learn the specifics of an action such as who created a resource, when and with what parameters.

In Voyager framework, audit logs are made use not only in audit trailing but also in aggregating data and having an overview.
This overview is what is called *metrics* in the rest of this document.


## Architecture

Voyager framework provides out of the box implementation for audit logging with sensible defaults. Once enabled, framework
will print audit logs to `stdout` with the details of the requests and the outcome in JSON format.

An example message is below.

```json
{
  "level": 30,
  "time": 1545385687476,
  "pid": 11889,
  "hostname": "localhost.localdomain",
  "tag": "AUDIT",
  "msg": "",
  "operationType": "query",
  "fieldName": "hello",
  "parentTypeName": "Query",
  "path": "hello",
  "success": true,
  "arguments": {},
  "clientInfo": {
    "clientId": "848d2a10-0505-11e9-888f-8d166149101a",
    "timestamp": 1545385686843,
    "data": {
      "app": {
        "appId": "org.aerogear.sync.example",
        "appVersion": "0.0.1",
        "sdkVersion": "0.0.1",
        "framework": "cordova"
      },
      "device": {
        "platform": "android",
        "platformVersion": "9",
        "device": "General Mobile GM8 Pro"
      }
    }
  },
  "userInfo": {
    "jti": "6ae0966a-9d61-430b-8167-d2b3c0b42709",
    "exp": 1545761725,
    "nbf": 0,
    "iat": 1545725725,
    "iss": "http://localhost:8080/auth/realms/voyager-testing",
    "aud": "voyager-testing",
    "sub": "ea2312e9-1aae-4b67-8674-a3aacf20a71d",
    "typ": "Bearer",
    "azp": "voyager-testing",
    "auth_time": 1545725725,
    "session_state": "1ba4d429-8010-4f38-8002-9cc72550850d",
    "acr": "1",
    "allowed-origins": [
      "*"
    ],
    "realm_access": {
      "roles": [
        "admin",
        "uma_authorization"
      ]
    },
    "resource_access": {
      "voyager-testing": {
        "roles": [
          "admin"
        ]
      },
      "account": {
        "roles": [
          "manage-account",
          "manage-account-links",
          "view-profile"
        ]
      }
    },
    "name": "Ali Ok",
    "preferred_username": "developer",
    "given_name": "Ali",
    "family_name": "Ok",
    "email": "aliok@example.com"
  },
  "v": 1
}
```

`clientInfo` property of the audit log message will only be available if the client is sending the client information to Voyager server. That 
has to be enabled separately in the client.
Also, data in that property can only be collected if the app is a Cordova app or a native app. Simple web clients cannot get the device/client/app details 
and thus cannot send this information.


`userInfo` property will only be available if the Voyager server is protected by an identity manager, such as Keycloak, and if the user is authenticated.

## Enabling audit logging in Voyager Server

Audit logging is not enabled by default in Voyager framework.

The only step necessary to enable audit logs is to import `voyagerResolvers` function and wrap your resolvers with it:
 
```javascript
const { voyagerResolvers } = require('@aerogear/apollo-voyager-server');

let myResolvers = {...};  // define your resolvers as you normally would.

myResolvers = voyagerResolvers(myResolvers, { auditLogging: true });

const schema = makeExecutableSchema({ typeDefs, myResolvers });
// ...
```

Your resolvers will be wrapped with Voyager's resolvers that produce audit logs.

## Sending device information in Voyager clients

In order to send device information to Voyager server, `auditLogging` has to be enabled while creating a client instance:
 
```javascript
import {createClient} from '@aerogear/datasync-js';

// ...

return await createClient({
            httpUrl: "http://path/to/graphql/endpoint",
            auditLogging: true
        });
```

Also, `cordova-plugin-aerogear-metrics` Cordova plugin has to be installed so that the device, client and app information can be collected:

```bash
cordova plugin add cordova-plugin-aerogear-metrics
```

## Exploring audit logs

Voyager framework prints audit logs simply to `stdout` and it is another component's responsibility to pick up these logs and provide
functionality to the user to make use of the logs.

While you can choose any solution as you like, EFK stack (ElasticSearch+Fluentd+Kibana) on OpenShift is the chosen solution in this guide.

## Configuring OpenShift

OpenShift logging can be enabled as described in [OpenShift documentation](https://docs.okd.io/3.11/install_config/aggregate_logging.html).

Once enabled, OpenShift logging will create a Fluentd instance per cluster node that reads the `stdout` and `stderr` of the pods in that node
and pushes the readings to the centralized ElasticSearch instance. Documents created in ElasticSearch instance can be then explored and 
visualized by the Kibana instance that's also installed by OpenShift logging.

OpenShift logging creates an index per namespace and that index is only available to users that have access to that namespace.
It also creates the index pattern in Kibana in the same way.

By default, OpenShift also provides a [curator](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/about.html) which deletes the old 
log messages from ElasticSearch to reduce storage needs and improve performance. This has an impact on audit trails and also metrics.

For long term audit trails, curator can be configured to delete messages older than your choice. If this is not sufficient,
Fluentd can be configured to write log messages to a separate storage, such as [S3](https://docs.fluentd.org/v0.12/articles/out_s3).

In terms of metrics, curator's deletion age config should not be set shorter than the desired time range that you would like
to see the metrics for.

While you can print anything to `stdout` in your application and they will end up in ElasticSearch, the functionality provided by Voyager 
framework is that audit log messages are printed in a format that is used by the Kibana dashboards also provided.


### Importing Kibana saved objects

A template for Kibana saved objects is available. When it is imported, a number of saved searches, visualizations and a
dashboard are created in Kibana.

OpenShift logging creates ElasticSearch indices per namespace and the index names have the format `project.<project-name>.<project-uid>`.
For example `project.myproject.49f9a0b6-09b5-11e9-9597-069f7827c758`.

It also creates a Kibana index pattern for that index using the pattern `project.<project-name>.<project-uid>.*`.

In order to make sure the Kibana saved objects use the correct index pattern, project UID should be fetched and
fed to the Kibana import template.  

```bash
PROJECT_NAME=<your_project_name>
# login with your user that has access to your project
oc login
# get project UUID, which is used to build the index name
PROJECT_UUID=`oc get project $PROJECT_NAME -o go-template='{{.metadata.uid}}'`

# replace the placeholders in the template
sed \
    -e "s/<PROJECT_NAME>/${PROJECT_NAME}/g" \
    -e "s/<PROJECT_UUID>/${PROJECT_UUID}/g" \
 kibanaImportTemplate.json > kibanaImport.json
```

You may find out `kibanaImportTemplate.json` [here](./kibanaImportTemplate.json).

Once the `kibanaImport.json` file is generated, it has to be imported into Kibana. 

To do that:
* Open Kibana (URL: <YOUR OPENSHIFT URL>/app/kibana)
* Click *Management* in the left
* Click *Saved Objects*
* Click *Import* and select `kibanaImport.json`

Imported saved objects have ids and names that have the project name or the UID in them. So, they may be created for each
namespace without affecting each other.

#### Notes

No index pattern is created in Kibana if there is no logs generated by an application.
Also, if the fields referenced in the prepared Kibana saved objects do not exist, errors such as the following can be seen:

```
Error: Importing AeroGear Data Sync - top level execution per platform - aaa (top_level_execution_per_platform_49f9a0b6-09b5-11e9-9597-069f7827c758) failed: Could not locate that index-pattern-field (id: audit.clientInfo.data.device.platform.raw)
Error: Could not locate that index-pattern-field (id: audit.clientInfo.data.device.platform.raw)
``` 

Because of these conditions, Kibana saved objects have to be imported after there is some audit logs are already in ElasticSearch.
At the moment, no mechanisms are provided to overcome this problem.

### Viewing the dashboard and audit logs

When the Kibana saved objects are imported, a dashboard will be available with lots of different visualizations.

That can be used as an overview of the Voyager application status.

At the bottom of the dashboard, audit log messages can be explored directly.

For more information on how to use Kibana, please consult [Kibana documentation](https://www.elastic.co/products/kibana).   
