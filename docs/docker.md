---
layout: default
title: Execute with docker
nav_order: 2
---

# Compiling and run with Docker

Download from Github:

    git clone https://github.com/rodrigoprestesmachado/cooperative-editor
    cd cooperative-editor 

Configure:

* Create the `settings.xml` file in `.m2/` directory. Thus, add this `.m2/settings.xml` (for more information, please check [Maven Web Site](https://maven.apache.org/settings.html)). The `settings.xml` file will contain information to replace some configurations to deploy Cooperative Editor in Wildfly. So, modify the below sample of `settings.xml` file according your server configuration:

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
                 <replace.communication>one gmail account (please, see the below note)</replace.communication>
             </properties>
         </profile>
    </profiles>
    <activeProfiles>
        <activeProfile>Wildfly</activeProfile>
        <activeProfile>CooperativeEditor</activeProfile>
    </activeProfiles>
</settings>
```

E-mail configuration:

The current implementation of the Cooperative Editor uses a Gmail account to send e-mail. Thus, configure it in the 'wildfly/standalone.xml' file in the below code.

```xml
<mail-session name="java:/CooperativeEditorEmail" jndi-name="java:/CooperativeEditorEmail" from="gmail">
    <smtp-server outbound-socket-binding-ref="mail-smtp-gmail" ssl="true" username="gmail" password="password" />
</mail-session>
```

Compile and package with [Maven](https://maven.apache.org):

    mvn replacer:replace compiler:compile resources:resources war:war

Execute with [docker-compose](https://docs.docker.com/compose/):

    docker-compose up -d
