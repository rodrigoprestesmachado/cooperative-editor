---
layout: default
title: Home
nav_order: 3
---

# Cooperative Editor Environment

* The Cooperative Editor is a JEE application tested in Wildfly (11.0.0.Final) with MySQL (5.5) database over an Ubuntu Server (14.04 - trusty)

# Wildfly

**An importante note:** to run Cooperation Editor, Wildfly must use `wildfly/standalone/configuration/standalone-full.xml ` version. Thus, rename the `standalone-full.xml` file to `standalone.xml`.

# MySQL datasource

1. Deploy an MySQL JDBC driver in the Wildfly 
1. In your Wildfly control panel, configure your a MySQL Datasource (Non-XA) to access the database through the following
JNI name `java:/CooperativeEditorDS`. 

# E-mail configuration
Cooperative Editor sends e-mails to invite the users to join in one activity
In `standalone/configuration/standalone.xml` file, find `<subsystem xmlns=”urn:jboss:domain:mail:3.0″>` and add:
```xml
<mail-session name=”java:/CooperativeEditorEmail” from=”cooperative.editor@gmail.com” jndi-name=”java:/CooperativeEditorEmail””>
    <smtp-server password=”your password” username=”your gmail account” ssl=”true” 
         outbound-socket-binding-ref=”mail-smtp-gmail”/>
</mail-session>
```

After, find `<socket-binding-group name=”standard-sockets” default-interface=”public” port offset=”${jboss.socket.binding.port-offset:0}”>` and add:

```xml
<outbound-socket-binding name=”mail-smtp-gmail” source-port=”0″ fixed-source-port=”false”>
    <remote-destination host=”smtp.gmail.com” port=”465″/>
</outbound-socket-binding>
```

Finally, find messaging-activemq session:
```xml
<subsystem xmlns="urn:jboss:domain:messaging-activemq:2.0">
    <server name="default">
```
And add the Cooperative Editor queue:

```xml
<jms-queue name="CooperativeEditorEmailQueue" entries="java:/jms/queue/CooperativeEditorEmailQueue"/>
```

# Compilation, packaging and installation with Maven

* The easiest way to use Cooperative Editor project is to install Maven on your machine. In Ubuntu, execute the following command:

``sudo apt-get install maven`` (note: use maven latest)

* After install Maven, you will need to create the `settings.xml` file in `.m2/` directory. Thus, add this `.m2/settings.xml` in your home or, alternatively, add the `settings.xml` file in Maven installation `${maven.home}/conf/settings.xml` (for more information, please check [Maven Web Site](https://maven.apache.org/settings.html)). The `settings.xml` file will contain information to replace some configurations and deploy Cooperative Editor in Wildfly. So, modify the below sample of `settings.xml` file according your server configuration:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" 
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
    <profiles>
         <profile>
             <id>Wildfly</id>
             <properties>
                 <wildfly.username>the admin username in wildfly</wildfly.username>
                 <wildfly.password>the admin password in wildfly</wildfly.password>
             </properties>
         </profile>
         <profile>
             <id>CooperativeEditor</id>
             <properties>
                 <replace.url>the url of your wildly server</replace.url>
                 <replace.port>the port of your wildfly server</replace.port>
                 <replace.communication>the gmail account</replace.communication>
             </properties>
         </profile>
    </profiles>
    <activeProfiles>
        <activeProfile>Wildfly</activeProfile>
        <activeProfile>CooperativeEditor</activeProfile>
    </activeProfiles>
</settings>
```

* Download the Cooperative Editor:

``git clone https://github.com/rodrigoprestesmachado/cooperative-editor``

* Enter in `pom.xml` directory and run an Maven commad:

``mvn replacer:replace compiler:compile resources:resources war:war wildfly:deploy``

* If you want, you can create a shell script in your Ubuntu server, for example:

```bash
#!/bin/sh
#
clear
git clone https://github.com/rodrigoprestesmachado/cooperative-editor
cd cooperative-editor
mvn replacer:replace compiler:compile resources:resources war:war wildfly:deploy
cd ..
rm -Rf cooperative-editor
```

# Load data

Once installed, you can load some [sound effects ](https://github.com/rodrigoprestesmachado/cooperative-editor/blob/master/src/META-INF/sql/sound-effect.sql) in the data base