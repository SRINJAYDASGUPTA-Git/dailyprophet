package net.ibmer.dailyprophet.wand.repositories;

import net.ibmer.dailyprophet.wand.models.Wand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WandRepo extends JpaRepository<Wand,String>{

}
