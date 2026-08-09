package com.crm;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.MapPropertySource;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@SpringBootApplication
@EnableScheduling
public class StartupCrmApplication {

	public static void main(String[] args) {
		var app = new SpringApplication(StartupCrmApplication.class);
		app.addInitializers(ctx -> {
			Dotenv dotenv = Dotenv.configure()
					.directory("./")
					.ignoreIfMalformed()
					.ignoreIfMissing()
					.load();

			Map<String, Object> envMap = StreamSupport.stream(dotenv.entries().spliterator(), false)
					.collect(Collectors.toMap(DotenvEntry::getKey, DotenvEntry::getValue));

			ctx.getEnvironment().getPropertySources()
					.addFirst(new MapPropertySource("dotenv", envMap));
		});
		app.run(args);
	}

}
