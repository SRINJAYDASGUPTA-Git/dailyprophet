package net.ibmer.dailyprophet.wand.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.ibmer.dailyprophet.user.models.User;

import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Table(name="wands")
public class Wand {
    @Id
    private String wandKey;

    private String length;
    private String wood;
    private String core;
    private String flexibility;
    private String imageUrl;

    @OneToMany(mappedBy = "wand", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<User> users;
}
