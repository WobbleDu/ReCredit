const pool = require('../db.js'); // Импортируем pool

//GET
const getNotifications = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM notifications ORDER BY id_notifications ASC', (error, results) => {
      if (error) {
        reject(error)
      }
      if(results.rows){
      resolve(results.rows);
      }
    })
  }) 
}

//GET
const getNotificationByID = (id) => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM notifications WHERE id_notifications = $1', [id], (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.rows.length === 0) {
          resolve(null);
        } else {
          resolve(results.rows[0]);
        }
    })
  })
}
//GET
const getNotificationByOwnerID = (id) => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM notifications WHERE user_id = $1', [id], (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.rows.length === 0) {
          resolve(null);
        } else {
          resolve(results.rows);
        }
    })
  })
}
//POST
const createNotification = (body) => {
  return new Promise(function(resolve, reject) {
    const { user_id, text, flag, datetime } = body
    pool.query('INSERT INTO notifications (user_id, text, flag, datetime) VALUES ($1, $2, $3, $4) RETURNING *', [user_id, text, flag, datetime], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve();
    })
  })
}

//DELETE
const deleteNotification = (id) => {
  return new Promise(function(resolve, reject) {

    pool.query('DELETE FROM notifications WHERE id_notifications = $1', [id], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Notification deleted with ID: ${id}`)
    })
  })
}

//PUT
const editNotificationByID = (body) => {
  return new Promise(function(resolve, reject) {
    const {id_notification, user_id, text, flag, datetime} = body
    console.log(id_notification, user_id, text, flag, datetime)
    pool.query('UPDATE customers SET user_id=$1, text=$2, flag=$3, datetime=$4', [user_id, text, flag, datetime], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Notification edited: ${id_notification}`);
    })
  })
}
const updateNotification = (id, flag) => {
  console.log('id: ',id,'\tflag: ',flag);
    return new Promise(function(resolve, reject) {
    pool.query('UPDATE notifications SET flag = $1 WHERE id_notifications = $2 RETURNING *',
      [flag, id], (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.rows.length === 0) {
          resolve(null);
        } else {
          resolve(results.rows[0]);
        }
    })
  })
  }
module.exports = {
  getNotifications,
  getNotificationByID,
  getNotificationByOwnerID,
  createNotification,
  deleteNotification,
  editNotificationByID,
  updateNotification
}