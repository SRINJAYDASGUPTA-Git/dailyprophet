package net.ibmer.dailyprophet.patronus.repositories;

import net.ibmer.dailyprophet.patronus.models.Patronus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatronusRepo extends JpaRepository<Patronus,String> {
}
