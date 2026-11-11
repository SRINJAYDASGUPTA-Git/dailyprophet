package net.ibmer.dailyprophet.user.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.ibmer.dailyprophet.comments.models.Comment;
import net.ibmer.dailyprophet.house.models.House;
import net.ibmer.dailyprophet.patronus.models.Patronus;
import net.ibmer.dailyprophet.post.models.Post;
import net.ibmer.dailyprophet.wand.models.Wand;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Principal;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "users")
public class User implements UserDetails, Principal {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String name;
    @Column(unique = true)
    private String email;
    private String password;
    private String imageUrl;
    private Boolean accountLocked;
    private Boolean enabled;

    @ManyToOne
    private Wand wand;

    @ManyToOne
    private House house;

    @ManyToOne
    private Patronus patronus;

    @OneToMany(mappedBy = "owner")
    private List<Post> posts;

    @ManyToMany(mappedBy = "likedBy")
    private List<Post> likedPosts;

    @OneToMany(mappedBy = "author")
    private List<Comment> comments;

    @ManyToMany(mappedBy = "likedBy")
    private List<Comment> likedComments;

    @ManyToMany(mappedBy = "sharedBy")
    private List<Post> sharedPosts;

    @ManyToMany(mappedBy = "savedBy")
    private List<Post> savedPosts;

    @ManyToMany(fetch = FetchType.EAGER)
    private List<Role> roles;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // The user's authorities are now derived from their memberships
        return this.roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .toList();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public boolean isAccountNonLocked() { return !accountLocked; }

    @Override
    public boolean isEnabled() { return enabled; }
}
