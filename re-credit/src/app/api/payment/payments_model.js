const pool = require('pg/lib/db.js'); // Импортируем pool

//GET
const getPayments = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM payments ORDER BY id_payment ASC', (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows); 
    })
  }) 
}

//GET
const getPaymentsByID = (id) => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM payments WHERE id_payment = $1', [id], (error, results) => {
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
const createPayments = (body) => {
  return new Promise(function(resolve, reject) {
    const { offer_id, datetime, summary, remain} = body
    pool.query('INSERT INTO payments (offer_id, datetime, summary, remain) VALUES ($1, $2, $3, $4) RETURNING *', [offer_id, datetime, summary, remain], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve();
    })
  })
}

//DELETE
const deletePayments = (id) => {
  return new Promise(function(resolve, reject) {

    pool.query('DELETE FROM payments WHERE id_payment = $1', [id], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Payments deleted with ID: ${id}`)
    })
  })
}

//PUT
const editPaymentsByID = (body) => {
  return new Promise(function(resolve, reject) {
    const {id_payments,offer_id, datetime, summary, remain} = body
    console.log(offer_id, datetime, summary, remain)
    pool.query('UPDATE payments SET offer_id=$2, datetime=$3, summary=$4, remain=$5 WHERE id_payments = $1', [id_payments, offer_id, datetime, summary, remain], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Payments edited`);
    })
  })
}

module.exports = {
  getPayments,
  getPaymentsByID,
  createPayments,
  deletePayments,
  editPaymentsByID
}