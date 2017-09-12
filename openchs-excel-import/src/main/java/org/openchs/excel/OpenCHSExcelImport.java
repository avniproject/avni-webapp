package org.openchs.excel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
<<<<<<< 25d6abb9f82f0744993e7ea0585ffcba1e5990a0
@ComponentScan(basePackages={"org.openchs"})
=======
@ComponentScan({"org.openchs"})
>>>>>>> Adding out to gitignore, bringing back the Excel Import App
public class OpenCHSExcelImport {
    public static void main(String[] args) {
        SpringApplication.run(OpenCHSExcelImport.class, args).close();
    }
<<<<<<< 25d6abb9f82f0744993e7ea0585ffcba1e5990a0
}
=======

}
>>>>>>> Adding out to gitignore, bringing back the Excel Import App
