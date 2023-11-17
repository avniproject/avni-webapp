FROM alpine
COPY build/ /build
RUN mkdir -p /opt/openchs/static/
CMD ["sh", "-c", "cp -r /build/* /opt/openchs/static/ && sleep infinity"]