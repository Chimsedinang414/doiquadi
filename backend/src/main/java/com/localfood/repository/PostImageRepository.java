package com.localfood.repository;

import com.localfood.model.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostImageRepository extends JpaRepository<PostImage, String> {
    List<PostImage> findByPost_Id(String postId);
}