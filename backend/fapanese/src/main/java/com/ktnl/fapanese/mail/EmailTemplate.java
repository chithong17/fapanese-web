package com.ktnl.fapanese.mail;

public interface EmailTemplate {
    String getSubject();
    String getContent(String... args);
}
