package org.openchs.excel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"org.openchs"})
@ComponentScan({"org.openchs"})
public class OpenCHSExcelImport {
    public static void main(String[] args) {
        SpringApplication.run(OpenCHSExcelImport.class, args).close();
    }
}
