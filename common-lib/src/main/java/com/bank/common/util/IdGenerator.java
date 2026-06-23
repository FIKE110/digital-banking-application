package com.bank.common.util;

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;
import com.github.f4b6a3.ulid.UlidCreator;

import java.util.UUID;

public final class IdGenerator {

    private IdGenerator() {}

    public static String generateUuid() {
        return UUID.randomUUID().toString();
    }

    public static String generateUlid() {
        return UlidCreator.getUlid().toString();
    }

    public static String generateNid() {
        return NanoIdUtils.randomNanoId();
    }

    public static String generateNid(int size) {
        return NanoIdUtils.randomNanoId(
                NanoIdUtils.DEFAULT_NUMBER_GENERATOR,
                NanoIdUtils.DEFAULT_ALPHABET,
                size
        );
    }

    public static String generateNid(char[] alphabet, int size) {
        return NanoIdUtils.randomNanoId(
                NanoIdUtils.DEFAULT_NUMBER_GENERATOR,
                alphabet,
                size
        );
    }
}
