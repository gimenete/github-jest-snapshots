FROM node:10-slim

LABEL com.github.actions.name="Jest Snapshots"
LABEL com.github.actions.description=""
LABEL com.github.actions.icon="aperture"
LABEL com.github.actions.color="yellow"
LABEL repository=""
LABEL maintainer="Alberto Gimeno <gimenete@gmail.com>"

COPY lib /action/lib
ENTRYPOINT ["/action/lib/entrypoint.sh"]
