package com.fitness.activityservice;

import com.fitness.activityservice.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, String> {
    List<Activity> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Activity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(a.caloriesBurned), 0) FROM Activity a")
    Integer getTotalCaloriesBurned();

    @Query("SELECT COALESCE(SUM(a.duration), 0) FROM Activity a")
    Integer getTotalDurationMinutes();

    @Query("SELECT COUNT(a) FROM Activity a")
    Long getTotalWorkoutsCount();
}

