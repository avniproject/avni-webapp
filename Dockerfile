FROM alpine

RUN mkdir -p /opt/openchs/static/
COPY build/ /opt/openchs/static/
CMD ["sh", "-c", "sleep infinity"]