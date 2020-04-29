FROM jboss/wildfly:19.0.0.Final

LABEL \
    org.opencontainers.image.authors="Rodrigo Prestes Machado" \
    description="Wildfly image for Cooperative Editor"

# creating a wildfly user and password
RUN /opt/jboss/wildfly/bin/add-user.sh editor editor --silent

# configuring datasource
COPY --chown=jboss:root wildfly/mysql-connector-java-8.0.19.jar /opt/jboss/wildfly/standalone/deployments
COPY --chown=jboss:root wildfly/standalone.xml /opt/jboss/wildfly/standalone/configuration

# deploying Cooperative Editor
COPY --chown=jboss:root target/CooperativeEditor.war /opt/jboss/wildfly/standalone/deployments

# starting wildfly with administration console
CMD ["/opt/jboss/wildfly/bin/standalone.sh", "-b", "0.0.0.0", "-bmanagement", "0.0.0.0"]