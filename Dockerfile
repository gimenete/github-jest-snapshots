FROM node:10-slim

LABEL com.github.actions.name="Jest Snapshots"
LABEL com.github.actions.description="Shows Jest Snapshots in the GitHub interface"
LABEL com.github.actions.icon="aperture"
LABEL com.github.actions.color="green"

LABEL maintainer="Alberto Gimeno <gimenete@gmail.com>"

COPY lib /action/lib
ENTRYPOINT ["/action/lib/entrypoint.sh"]
