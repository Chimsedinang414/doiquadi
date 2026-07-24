package com.localfood.repository;

import com.localfood.model.PostTag;
import com.localfood.model.PostTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostTagRepository extends JpaRepository<PostTag, PostTagId> {
    List<PostTag> findByPost_Id(String postId);
}