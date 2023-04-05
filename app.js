const express = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");

const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "moviesData.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//Get Movies
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT * FROM
    movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//Create Movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `
    INSERT INTO
    movie (director_id,movie_name,lead_actor)
    VALUES
    (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;
  const dbResponse = await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

//Get Movie
const convertFullDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM
    movie
    WHERE
    movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertFullDbObjectToResponseObject(movie));
});

//Update Movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetailsQuery = `
    UPDATE 
    movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}';`;
  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//Delete Movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
    movie
    WHERE 
    movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET Directors
const convertDirectorObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM
    director
    ORDER BY 
    director_id;`;
  const directorList = await db.all(getDirectorsQuery);
  response.send(
    directorList.map((eachObject) =>
      convertDirectorObjectToResponseObject(eachObject)
    )
  );
});

// Get Director Movies

const getMovieName = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getDirectorMoviesQuery = `
    SELECT * FROM 
    movie
    WHERE
    director_id = ${directorId};`;

  const movieArray = await db.all(getDirectorMoviesQuery);
  response.send(movieArray.map((eachMovie) => getMovieName(eachMovie)));
});

module.exports = app;
