package net.ibmer.dailyprophet.house.repositories;

import net.ibmer.dailyprophet.house.models.House;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HouseRepo extends JpaRepository<House, String> {
}
