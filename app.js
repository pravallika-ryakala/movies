const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at localhost:3000");
    });
  } catch (e) {
    console.log(`Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Get movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie;`;
  const dbResult = await db.all(getMoviesQuery);
  response.send(dbResult.map((each) => convertDBObjectToResponseObject(each)));
});

//Add new movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
        INSERT INTO movie (director_id,movie_name,lead_actor)
        VALUES (
            '${directorId}',
            '${movieName}',
            '${leadActor}'
        );
    `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM MOVIE WHERE movie_id=${movieId};
    `;
  const dbResponse = await db.get(getMovieQuery);
  response.send(convertDBObjectToResponseObject(dbResponse));
});

//Update movie details API
app.put("/movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie 
    SET 
    director_id=${directorId},
    movie_name=${movieName},
    lead_actor=${leadActor}
    WHERE 
    movie_id=${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete movie API
app.delete("/movies/moviesId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id=${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
