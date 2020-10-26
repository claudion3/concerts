const express = require("express");
const router = express.Router();
const knex = require("../database");

// get concerts by id
const getConcertsById = async (id) => {
	try {
		return await knex("concerts").select("*").where({
			id: id,
		});
	} catch (error) {
		console.log(error);
	}
};
router.get("/:id", async (request, response) => {
	let concertsId = Number(request.params.id);
	getConcertsById(concertsId)
		.then((result) => response.json(result))
		.catch((error) => {
			response.status(400).send("Bad request").end();
			console.log(error);
		});
});

// specific number of concerts
const getLatestLimit = async (limit) => {
	try {
		return await knex("concerts")
			.select("*")
			.orderBy("id", "DESC")
			.limit(limit);
	} catch (error) {
		console.log(error);
	}
};
router.get("/", async (request, response) => {
	let limit = Number(request.query.limit);
	getLatestLimit(limit).then((result) => response.json(result));
	try {
		const concerts = await knex("concerts");
		response.json(concerts);
	} catch (error) {
		throw error;
	}
});

//Edit concerts
const editConcerts = async ({ body, id }) => {
	const { title, price } = body;
	const contact = await knex.from("concerts").select("*").where({
		id: id,
	});
	if (contact.length === 0) {
		throw new HttpError("Bad request", `Contact not found: ID ${id}!`, 404);
	}
	const queryDto = {
		title: title,
		price: price,
	};
	if (Object.keys(queryDto).length !== 0) {
		return await knex("concerts")
			.where({
				id: id,
			})
			.update(queryDto);
	} else return "Nothing updated!";
};

router.put("/:id", async (request, response) => {
	editConcerts({
		body: request.body,
		id: request.params.id,
	})
		.then((result) => response.json(result))
		.catch((error) => {
			response.status(400).send("Bad request").end();
			console.log(error);
		});
});

//create a concert
router.post("/", async (request, response) => {
	createConcerts({
		body: request.body,
	})
		.then((result) => response.json(result))
		.catch((error) => {
			response.status(400).send("Bad request").end();
			console.log(error);
		});
	try {
		const concerts = await knex("concerts");
		response.json(concerts);
	} catch (error) {
		throw error;
	}
});

const createConcerts = async ({ body }) => {
	const { title, band, venue, created_date, performance_date, price } = body;
	return await knex("concerts").insert({
		title: title,
		band: band,
		venue: venue,
		created_date: created_date,
		performance_date: performance_date,
		price: price,
	});
};

//Delete concert
const deleteConcerts = async ({ body }) => {
	try {
		if (!body.id) {
			throw new HttpError("Bad request", "Id not found", 400);
		}
		return knex("concerts")
			.where({
				id: body.id,
			})
			.del();
	} catch (err) {
		console.log(err);
		return "something went wrong, try again";
	}
};
router.delete("/", async (request, response) => {
	deleteConcerts({
		body: request.body,
	})
		.then((result) => response.json(result))
		.catch((error) => {
			response.status(400).send("Bad request").end();
			console.log(error);
		});
});
module.exports = router;
