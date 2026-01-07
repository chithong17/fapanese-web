    package com.ktnl.fapanese;

    import org.springframework.boot.SpringApplication;
    import org.springframework.boot.autoconfigure.SpringBootApplication;
    import org.springframework.scheduling.annotation.EnableScheduling;

    @SpringBootApplication
    @EnableScheduling //Bật tính năng lập lịch (Scheduling)
    public class FapaneseApplication {

        public static void main(String[] args) {
            SpringApplication.run(FapaneseApplication.class, args);
        }

    }
