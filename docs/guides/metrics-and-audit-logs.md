# Audit Logs and Metrics

## Overview

Audit logging is a mechanism to track the actions. This is useful to learn the specifics of an action such as who created 
a resource, when and with what parameters.

In Voyager framework, audit logs can be used not only for audit trailing but also for aggregating data and having an overview.
This overview is what is called *metrics* in the rest of this document.


## Architecture

Voyager framework provides out of the box implementation for audit logging with sensible defaults. Once enabled, framework
prints audit logs to `stdout` with the details of the requests and their outcome in JSON format.

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

`clientInfo` property of the audit log message is available only if the client is sending the client information to Voyager server. That 
has to be enabled separately in the client.
Also, data in that property can only be collected if the app is a Cordova app or a native app. Simple web clients cannot get the device, client nor app details 
and thus cannot send this information.

`userInfo` property is available only if the Voyager server is protected by an identity manager, such as Keycloak, and if the user is authenticated.

## Enabling Audit Logging in Voyager Server

Audit logging is not enabled by default in Voyager framework.

The only step necessary to enable audit logs is to import `voyagerResolvers` function and wrap the resolvers with it:
 
```javascript
const { voyagerResolvers } = require('@aerogear/voyager-server');

let myResolvers = {...};  // define your resolvers as you normally would.

myResolvers = voyagerResolvers(myResolvers, { auditLogging: true });

const schema = makeExecutableSchema({ typeDefs, myResolvers });
// ...
```

Resolvers will be wrapped with Voyager's resolvers that produce audit logs.

## Sending Device Information in Voyager Clients

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

## Exploring Audit Logs

Voyager framework simply prints audit logs to `stdout` and it is responsibility of another component to pick up these logs and provide
functionality to the user to make use of the logs.

Although you can choose any solution as you like, EFK stack (ElasticSearch+Fluentd+Kibana) on OpenShift is the chosen solution in this guide.

Also, although you can print anything to `stdout` in your application as audit logs and they are sent to ElasticSearch by Fluentd, the functionality 
provided by Voyager framework is that the audit log messages are printed in a format that is used by the Kibana dashboards that are also provided.

## Configuring OpenShift

OpenShift logging can be enabled as described in [OpenShift documentation](https://docs.okd.io/3.11/install_config/aggregate_logging.html).

Once enabled, OpenShift logging will create a Fluentd instance per cluster node that reads the `stdout` and `stderr` of the pods in that node
and pushes the readings to the centralized ElasticSearch instance. Documents created in ElasticSearch instance can be then explored and 
visualized by the Kibana instance, which is also installed by OpenShift logging.

OpenShift logging creates an index per namespace and that index is only available to users who have access to that namespace.
It also creates the index patterns in Kibana in the same way.

By default, OpenShift also provides a [curator](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/about.html) which deletes the old 
log messages from ElasticSearch to reduce storage needs and improve performance. This has an impact on audit trails and also metrics.

For long term audit trails, curator can be configured to delete messages older than your choice. If this is not sufficient,
Fluentd can be configured to write log messages to a separate storage, such as [S3](https://docs.fluentd.org/v0.12/articles/out_s3).

In terms of metrics, curator's deletion age config should not be set shorter than the desired time range that you would like
to see the metrics for.


### Importing Kibana Saved Objects

Kibana is a visualization tool that has a great integration with ElasticSearch.

A template for Kibana saved objects is available. When the saved objects are imported, a number of saved searches, visualizations and a
dashboard are created in Kibana. These then can be used to have an overview of the Voyager application.

A screenshot of the provided dashboard, which consists of multiple visualizations, is below.

![](kibana-dashboard-screenshot.png) 

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

You may find `kibanaImportTemplate.json` [here](./kibanaImportTemplate.json).

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

### Viewing the Dashboard and Audit Logs

When the Kibana saved objects are imported, a dashboard is available with several visualizations that can be used as an 
overview of the Voyager application status.

At the bottom of the dashboard, audit log messages can be explored directly.

For more information on how to use Kibana, please consult [Kibana documentation](https://www.elastic.co/products/kibana).
