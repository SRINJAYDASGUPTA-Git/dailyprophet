package net.ibmer.dailyprophet;

import net.ibmer.dailyprophet.user.models.Role;
import net.ibmer.dailyprophet.user.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DailyprophetApplication {

	public static void main(String[] args) {
		SpringApplication.run(DailyprophetApplication.class, args);
	}
	@Bean
	public CommandLineRunner runner(RoleRepository roleRepository) {
		return args -> {
			if(roleRepository.findByName ("USER").isEmpty ()){
				roleRepository.save (
						Role.builder ()
								.name ("USER")
								.build ()
				);
			}
		};
	}

}
