const pool = require('pg/lib/db.js'); // Импортируем pool

//GET
const getOffers = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM offers ORDER BY id_offer ASC', (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows); 
    })
  })
}

//GET
const getOfferByID = (id) => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM offers WHERE id_offer = $1', [id], (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.rows.length === 0) {
          resolve(null);  // Пользователь не найден - резолвим с null или пустым объектом
        } else {
          resolve(results.rows[0]);
        }
    })
  })
}

//POST
const createOffer = (body) => {
  return new Promise(function(resolve, reject) {
    const { owner_id, guest_id, type, creditsum, interestrate, state, datestart, dateend } = body
    pool.query('INSERT INTO offers (owner_id, guest_id, type, creditsum, interestrate, state, datestart, dateend) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [owner_id, guest_id, type, creditsum, interestrate, state, datestart, dateend], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve();
    })
  })
}

//DELETE
const deleteOffer = (id) => {
  return new Promise(function(resolve, reject) {

    pool.query('DELETE FROM offers WHERE id_offer = $1', [id], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Offer deleted with ID: ${id}`)
    })
  })
}

//PUT
const editOfferByID = (body) => {
  return new Promise(function(resolve, reject) {
    const { id_offer,owner_id, guest_id, type, creditsum, interestrate, state, datestart, dateend } = body
    console.log(id_offer,owner_id, guest_id, type, creditsum, interestrate, state, datestart, dateend)
    pool.query('UPDATE offers SET owner_id=$2, guest_id=$3, type=$4, creditsum=$5, interestrate=$6, state=$7, datestart=$8, dateend=$9 WHERE id_user = $1', [owner_id, guest_id, type, creditsum, interestrate, state, datestart, dateend], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Offer edited`);
    })
  })
}

module.exports = {
  getOffers,
  getOfferByID,
  createOffer,
  deleteOffer,
  editOfferByID
}