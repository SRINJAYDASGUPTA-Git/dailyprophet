package net.ibmer.dailyprophet.patronus.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.ibmer.dailyprophet.user.models.User;

import java.util.List;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "patronusCharms")
public class Patronus {
    @Id
    private String name;

    private String imageUrl;

    @OneToMany(mappedBy = "patronus", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<User> users;
}
