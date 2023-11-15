FROM alpine
COPY build/ /build
CMD ["sh", "-c", "cp -r /build/* /opt/openchs/static/ && sleep infinity"]