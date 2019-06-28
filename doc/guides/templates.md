# Installing the Data Sync OpenShift Templates into the Service Catalog

Prerequisites
  * OpenShift Cluster

There are a number of Data Sync OpenShift Templates available.

* [Data Sync App](https://github.com/aerogear/datasync-deployment/blob/master/openshift/datasync-http.yml) - Deploys a custom built Data Sync Application
* [Data Sync Showcase](https://github.com/aerogear/datasync-deployment/blob/master/openshift/datasync-showcase.yml) - Deploys the server component from the [Ionic Showcase](https://github.com/aerogear/ionic-showcase) application.
* [Data Sync Showcase Community](https://github.com/aerogear/datasync-deployment/blob/master/openshift/datasync-showcase-community.yml) - Deploys the server component from the [Ionic Showcase](https://github.com/aerogear/ionic-showcase) application , but replaces Red Hat AMQ Online with [Mosquitto](https://mosquitto.org/) as the MQTT broker.

The templates can be installed into a given namespace.

```
oc create -f https://raw.githubusercontent.com/aerogear/datasync-deployment/master/openshift/datasync-http.yml -n <namespace>
oc create -f https://raw.githubusercontent.com/aerogear/datasync-deployment/master/openshift/datasync-showcase.yml -n <namespace>
oc create -f https://raw.githubusercontent.com/aerogear/datasync-deployment/master/openshift/datasync-showcase-community.yml -n <namespace>
```

# Deploying the Showcase Server from the Service Catalog

Prerequisites

* Using an Integreatly/Red Hat Managed Integration (RHMI) cluster
* AMQ Online is installed in the cluster

This section describes how to deploy the showcase in an Integreatly cluster from the OpenShift Service Catalog.

* Create a new project or namespace in the OpenShift Web Console
* In the new project use the 'Search Catalog' bar to search for 'Data Sync Showcase'
 <!-- <image of search bar> -->
* The form is already prefilled with all of the necessary values.
 <!-- image of the form -->
* The only field you might want to change is `AMQ Messaging User Password`.
  * The default value is `Password1` in base64 encoding
  * The value *must* be base64 encoded
  * A custom value can be created in the terminal using `$ echo <password> | base64` 
* When the create button is clicked, a warning message may be displayed
  <!-- This warning shows up because resources are being created in AMQ Online. We can ignore this. -->

> This will create resources that may have security or project behavior implications. Make sure you understand what they do before creating them. The resources being created are: address space, address, messaging user

The hostname for the AMQ Online Broker, (needed by the ionic-showcase-server) is only made available after the resources from the the template have been provisioned. One more step is needed to update the ionic-showcase-server deployment with the correct `MQTT_HOST` environment variable.

* From the terminal, ensure you have the correct namespace selected.

```
oc project <project where template was provisioned>
```

* Update the ionic-showcase-server deployment to add the `MQTT_HOST` variable. 

```
oc set env dc/ionic-showcase-server MQTT_HOST="$(oc get addressspace showcase -o jsonpath='{.status.endpointStatuses[?(@.name=="messaging")].serviceHost}')"
```

At this point, the showcase server is provisioned and the logs from the ionic-showcase-server pod will include the output `connected to messaging service`.

