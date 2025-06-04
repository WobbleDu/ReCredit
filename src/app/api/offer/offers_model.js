const pool = require('../db.js'); // Импортируем pool

// GET все предложения с информацией о владельцах
const getOffers = () => {
  return new Promise(function(resolve, reject) {
    pool.query(`
      SELECT 
        o.*, 
        u.id_user as owner_id,
        u.firstname as owner_firstname,
        u.lastname as owner_lastname
        -- другие поля пользователя при необходимости
      FROM offers o
      LEFT JOIN _users u ON o.owner_id = u.id_user
      ORDER BY o.id_offer ASC
    `, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  });
};

const getRecommendedOffers = (userId) => {
  return new Promise(function(resolve, reject) {
    pool.query(`
      SELECT 
        o.id_offer AS id_offer,
        o.type AS type,
        o.creditsum AS creditsum,
        o.interestrate AS interestrate,
        u.firstname AS owner_firstname,
        u.lastname AS owner_lastname
      FROM 
        offers o
      JOIN 
        _users u ON o.owner_id = u.id_user
      WHERE 
        o.interestrate < 15
        AND o.state = 0
        AND o.creditSum <= (SELECT income * 10 FROM _users WHERE id_user = $1)
        AND o.owner_id != $1
    `, [userId], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  });
};

const getActiveOffers = (userId) => {
  return new Promise(function(resolve, reject) {
    pool.query(`
      SELECT 
        o.id_offer AS id_offer,
        o.type AS type,
        o.creditsum AS creditsum,
        o.interestrate AS interestrate,
        u.firstname AS owner_firstname,
        u.lastname AS owner_lastname
      FROM 
        offers o
      JOIN 
        _users u ON o.owner_id = u.id_user
      WHERE 
        o.state = 0
        AND o.owner_id != $1
    `, [userId], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  });
};

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
    const { id_offer, owner_id, guest_id, type, creditsum, interestrate, state, datestart, dateend } = body;
    pool.query(
      'UPDATE offers SET owner_id=$2, guest_id=$3, type=$4, creditsum=$5, interestrate=$6, state=$7, datestart=$8, dateend=$9 WHERE id_offer = $1', 
      [id_offer, owner_id, guest_id, type, creditsum, interestrate, state, datestart, dateend], 
      (error, results) => {
        if (error) {
          reject(error);
        }
        resolve({ 
          success: true, 
          updatedOffer: body,
          rowCount: results.rowCount  // Using the results
        });
      }
    );
  });
};
module.exports = {
  getOffers,
  getOfferByID,
  createOffer,
  deleteOffer,
  editOfferByID, 
  getRecommendedOffers,
  getActiveOffers
}