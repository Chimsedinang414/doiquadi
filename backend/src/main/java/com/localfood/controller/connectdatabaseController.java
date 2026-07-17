package com.localfood.controller;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;



public class connectdatabaseController {

    String url = "jdbc:mysql://localhost:3306/doiquadi";
    String name = "root";
    String password = "142857";
    String driver = "com.mysql.cj.jdbc.Driver";
    
    
    public static void main(String[] args) {
        System.out.println("Connecting to the database...");
        Connection conn = null;
        Statement stmt = null;
        try {
            Class.forName(driver);
            conn = DriverManager.getConnection(url, name, password);
            stmt = conn.createStatement();
            System.out.println("Connected to the database.");
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }


}
