package com.founderbridge.shared;

import io.lettuce.core.*;
import io.lettuce.core.api.*;
import io.lettuce.core.codec.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host:localhost}")
    private String host;
    @Value("${spring.data.redis.port:6379}")
    private int port;
    @Value("${spring.data.redis.password:}")
    private String password;

    @Bean(destroyMethod = "close")
    public RedisClient redisClient() {
        String uri = password.isBlank()
            ? String.format("redis://%s:%d", host, port)
            : String.format("redis://:%s@%s:%d", password, host, port);
        return RedisClient.create(uri);
    }

    @Bean(destroyMethod = "close")
    public StatefulRedisConnection<String, byte[]> redisConnection(RedisClient client) {
        return client.connect(RedisCodec.of(StringCodec.UTF8, ByteArrayCodec.INSTANCE));
    }
}
