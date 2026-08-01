package com.dsavisualizer.migration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

class FlywayMigrationTest {
    @Test
    void migrationsCreateTheBaselineAndLearningLoopTablesOnANewDatabase() throws Exception {
        String url = "jdbc:h2:mem:flyway-new;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1";
        Flyway flyway = flyway(url);

        flyway.migrate();
        flyway.migrate();

        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            assertThat(tableExists(connection, "users")).isTrue();
            assertThat(tableExists(connection, "user_progress")).isTrue();
            assertThat(tableExists(connection, "user_problem_progress")).isTrue();
            assertThat(tableExists(connection, "problem_attempts")).isTrue();
            assertThat(indexExists(connection, "execution_receipts", "ix_execution_receipt_consume")).isTrue();
            assertThat(indexExists(connection, "user_problem_progress", "ix_user_problem_progress_user_updated")).isTrue();
            assertThat(indexExists(connection, "user_problem_progress", "ix_user_problem_progress_problem")).isTrue();
            assertThat(indexExists(connection, "user_problem_progress", "ix_user_problem_progress_user_completed")).isTrue();
            assertThat(indexExists(connection, "problem_attempts", "ix_problem_attempts_user_problem_created")).isTrue();
            assertThat(indexExists(connection, "problem_attempts", "ix_problem_attempts_user_created")).isTrue();
            assertThat(indexExists(connection, "problem_attempts", "ix_problem_attempts_receipt")).isTrue();
        }
        assertThat(Arrays.stream(flyway.info().applied()).map(info -> info.getVersion().getVersion()))
                .containsExactly("1", "2", "3");
    }

    @Test
    void baselineCanRunAgainstAnExistingDdlAutoDatabase() throws Exception {
        String url = "jdbc:h2:mem:flyway-existing;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1";
        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            connection.createStatement().execute("create table users (id varchar(255) primary key)");
        }

        flyway(url).migrate();

        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            assertThat(tableExists(connection, "practice_problems")).isTrue();
            assertThat(tableExists(connection, "user_problem_progress")).isTrue();
            assertThat(tableExists(connection, "problem_attempts")).isTrue();
        }
    }

    private Flyway flyway(String url) {
        return Flyway.configure()
                .dataSource(url, "sa", "")
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .load();
    }

    private boolean tableExists(Connection connection, String tableName) throws Exception {
        try (ResultSet resultSet = connection.getMetaData().getTables(null, null, tableName, new String[]{"TABLE"})) {
            return resultSet.next();
        }
    }

    private boolean indexExists(Connection connection, String tableName, String indexName) throws Exception {
        DatabaseMetaData metadata = connection.getMetaData();
        try (ResultSet resultSet = metadata.getIndexInfo(null, null, tableName, false, false)) {
            while (resultSet.next()) {
                String actualIndexName = resultSet.getString("INDEX_NAME");
                if (indexName.equalsIgnoreCase(actualIndexName)) {
                    return true;
                }
            }
        }
        return false;
    }
}
