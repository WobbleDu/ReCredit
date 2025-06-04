const express = require('express')
const cors = require("cors");
const app = express()
const port = 3001
app.use(cors());
app.use(express.json())
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
  next();
});


{//USERS
const user_model = require('./src/app/api/user/user_model')
//LOGIN
app.post('/', (req, res) => {
  user_model.checkLogin(req.body)
    .then(userId => {
      if (!userId) {
        return res.status(401).json({ message: 'Неверный логин или пароль' });
      }
      console.log(res);
      res.status(200).json({ user_id: userId }); // Теперь фронтенд получит `user_id`
    })
    .catch(error => {
      console.error('Error login user:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    });
});
app.get('/users', async (req, res) => {
  try {
    const response = await user_model.getUsers(); // Используем асинхронность
    res.status(200).send(response);              // Отправляем успешный ответ
    console.log('Получил всех пользователей.');
  } catch (error) {                              // Ловим любую возникшую ошибку
    console.error('Ошибка получения пользователей:', error.message || error); // Логируем ошибку
    res.status(500).json({ message: error.message }); // Возвращаем JSON с сообщением об ошибке
  }
});
app.get('/users/:id',(req,res) =>{
    if (isNaN(req.params.id)) {  // Проверяем, что ID - число
    res.status(400).send('Invalid user ID');
    return;
    }
    user_model.getUserByID(req.params.id)
    .then(response => {
        if (!response) {
        res.status(404).send('User not found');
        console.log(`User with ID: ${req.params.id} not found`);
         } else {
        res.status(200).json(response);
        console.log(`Got user with ID: ${req.params.id}.`);
         }
})
    .catch(error =>{
        res.status(500).send(error);
    })
})
app.delete('/users/:id',(req,res) =>{
    if (isNaN(req.params.id)) {  // Проверяем, что ID - число
    res.status(400).send('Invalid user ID');
    return;
    }
    user_model.deleteUser(req.params.id)
    .then(response => {
        if (!response) {
        res.status(404).send('User not found');
        console.log(`User with ID: ${req.params.id} not found`);
         } else {
        res.status(200).json(response);
        console.log(`Deleted user  with ID: ${req.params.id}.`);
         }
})
    .catch(error =>{
        res.status(500).send(error);
    })
})
app.post('/users', (req, res) => {
  user_model.createUser(req.body)
    .then(response => {
      res.status(201).send(response);
      console.log('User created successfully:', response);
    })
    .catch(error => {
      console.error('Error creating user:', error);
      
      // Кастомные статусы для разных ошибок
      if (error.message.includes('обязательные поля')) {
        res.status(400).send({ error: error.message });
      } else if (error.message.includes('email уже существует')) {
        res.status(409).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal server error' });
      }
    });
});
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Проверка наличия ID
  if (!userId) {
    return res.status(400).send({ error: 'User ID is required' });
  }

  // Проверка тела запроса
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send({ error: 'Request body is empty' });
  }

  const userData = { 
    id: userId,
    ...req.body 
  };

  user_model.editUserByID(userData)
    .then(response => {
      res.status(200).json({
        success: true,
        message: `User with ID ${userId} updated successfully`,
        data: response
      });
      console.log(`User ${userId} updated:`, req.body);
    })
    .catch(error => {
      console.error(`Error updating user ${userId}:`, error);
      
      // Определяем тип ошибки
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: `Failed to update user ${userId}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
});
}
{//NOTIFICATIONS
  const notification_model = require('./src/app/api/notification/notification_model')
  app.put('/notifications/:id', (req, res) => {

  const { flag } = req.body;

  notification_model.updateNotification(req.params.id, flag)
    .then(updatedNotification => {
      res.status(200).json(updatedNotification);
      console.log('Notification updated');
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    });
});
app.get('/notifications', (req, res) => {
  notification_model.getNotifications()
  .then(response => {
    res.status(200).send(response);
    console.log('Got all notifications');
  })
  .catch(error => {
    res.status(500).send(error);
  })
})
app.get('/notifications/:id',(req,res) =>{
    if (isNaN(req.params.id)) {  // Проверяем, что ID - число
    res.status(400).send('Invalid notification ID');
    return;
    }
    notification_model.getNotificationByID(req.params.id)
    .then(response => {
        if (!response) {
        res.status(404).send('Notification not found');
        console.log(`Notification with ID: ${req.params.id} not found`);
         } else {
        res.status(200).json(response);
        console.log(`Got notification with ID: ${req.params.id}.`);
         }
})
    .catch(error =>{
        res.status(500).send(error);
    })
})
app.delete('/notification/:id',(req,res) =>{
    if (isNaN(req.params.id)) {  // Проверяем, что ID - число
    res.status(400).send('Invalid notification ID');
    return;
    }
    notification_model.deleteNotification(req.params.id)
    .then(response => {
        if (!response) {
        res.status(404).send('Notification not found');
        console.log(`Notification with ID: ${req.params.id} not found`);
         } else {
        res.status(200).json(response);
        console.log(`Deleted notification with ID: ${req.params.id}.`);
         }
})
    .catch(error =>{
        res.status(500).send(error);
    })
})
app.post('/notifications', (req, res) => {
  notification_model.createNotification(req.body)
    .then(response => {
      res.status(201).send(response);
      console.log('Notification created successfully:', response);
    })
    .catch(error => {
      console.error('Error creating user:', error);
      
      // Кастомные статусы для разных ошибок
      if (error.message.includes('обязательные поля')) {
        res.status(400).send({ error: error.message });
      } else if (error.message.includes('email уже существует')) {
        res.status(409).send({ error: error.message });
      } else {
        res.status(500).send({ error: 'Internal server error' });
      }
    });
});
app.put('/notifications/:id', (req, res) => {
  // Проверка наличия ID
  if (!req.params.id) {
    return res.status(400).send({ error: 'Notification ID is required' });
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send({ error: 'Request body is empty' });
  }
  const userData = { 
    id: req.params.id,
    ...req.body 
  };
  user_model.editUserByID(userData)
    .then(response => {
      res.status(200).json({
        success: true,
        message: `Notification with ID ${req.params.id} updated successfully`,
        data: response
      });
      console.log(`Notification ${req.params.id} updated:`, req.body);
    })
    .catch(error => {
      console.error(`Error updating notification ${req.params.id}:`, error);
      
      // Определяем тип ошибки
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: `Failed to update notification ${userId}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
});
//GET NOTIFICATION FOR ID OWNER
app.get('/user/:id/notifications', (req, res) => {
  notification_model.getNotificationByOwnerID(req.params.id)
  .then(response => {
    res.status(200).send(response);
    console.log('Got all user notifications');
  })
  .catch(error => {
    res.status(500).send(error);
  })
})
}
{//PAYMENTS
const payment_model = require('./src/app/api/payment/payments_model')
app.get('/payments', (req, res) => {
  payment_model.getPayments()
  .then(response => {
    res.status(200).send(response);
    console.log('Got all payments');
  })
  .catch(error => {
    res.status(500).send(error);
  })
})
app.get('/payments/:id',(req,res) =>{
    if (isNaN(req.params.id)) {  // Проверяем, что ID - число
    res.status(400).send('Invalid payment ID');
    return;
    }
    payment_model.getPaymentsByID(req.params.id)
    .then(response => {
        if (!response) {
        res.status(404).send('Payment not found');
        console.log(`Payment with ID: ${req.params.id} not found`);
         } else {
        res.status(200).json(response);
        console.log(`Got payment with ID: ${req.params.id}.`);
         }
})
    .catch(error =>{
        res.status(500).send(error);
    })
})
app.delete('/payments/:id',(req,res) =>{
    if (isNaN(req.params.id)) {  // Проверяем, что ID - число
    res.status(400).send('Invalid payment ID');
    return;
    }
    payment_model.deletePayments(req.params.id)
    .then(response => {
        if (!response) {
        res.status(404).send('Payment not found');
        console.log(`Payment with ID: ${req.params.id} not found`);
         } else {
        res.status(200).json(response);
        console.log(`Deleted payment with ID: ${req.params.id}.`);
         }
})
    .catch(error =>{
        res.status(500).send(error);
    })
})
app.post('/payments', (req, res) => {
  payment_model.createPayments(req.body)
    .then(response => {
      res.status(201).send(response);
      console.log('Payment created successfully:', response);
    })
    .catch(error => {
      console.error('Error creating payment:', error);
    });
});
app.put('/payments/:id', (req, res) => {
  const paymentId = req.params.id;
  
  // Проверка наличия ID
  if (!paymentId) {
    return res.status(400).send({ error: 'Payment ID is required' });
  }

  // Проверка тела запроса
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send({ error: 'Request body is empty' });
  }

  const paymentData = { 
    id: paymentId,
    ...req.body 
  };

  payment_model.editPaymentsByID(paymentData)
    .then(response => {
      res.status(200).json({
        success: true,
        message: `Payment with ID ${paymentId} updated successfully`,
        data: response
      });
      console.log(`Payment ${paymentId} updated:`, req.body);
    })
    .catch(error => {
      console.error(`Error updating payment ${paymentId}:`, error);
      
      // Определяем тип ошибки
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: `Failed to update payment ${paymentId}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
});
}
{
  //OFFERS
const offers_model = require('./src/app/api/offer/offers_model')
app.get('/offers', (req, res) => {
  offers_model.getOffers()
  .then(response => {
    res.status(200).send(response);
    console.log('Got all offers');
  })
  .catch(error => {
    res.status(500).send(error);
  })
})
app.get('/offers/:id',(req,res) =>{
    if (isNaN(req.params.id)) {  // Проверяем, что ID - число
    res.status(400).send('Invalid offer ID');
    return;
    }
    offers_model.getOfferByID(req.params.id)
    .then(response => {
        if (!response) {
        res.status(404).send('Offer not found');
        console.log(`Offer with ID: ${req.params.id} not found`);
         } else {
        res.status(200).json(response);
        console.log(`Got offer with ID: ${req.params.id}.`);
         }
})
    .catch(error =>{
        res.status(500).send(error);
    })
})
app.delete('/offers/:id',(req,res) =>{
    if (isNaN(req.params.id)) {  // Проверяем, что ID - число
    res.status(400).send('Invalid offer ID');
    return;
    }
    offers_model.deleteUser(req.params.id)
    .then(response => {
        if (!response) {
        res.status(404).send('Offer not found');
        console.log(`Offer with ID: ${req.params.id} not found`);
         } else {
        res.status(200).json(response);
        console.log(`Deleted offer with ID: ${req.params.id}.`);
         }
})
    .catch(error =>{
        res.status(500).send(error);
    })
})
app.post('/offers', (req, res) => {
  offers_model.createOffer(req.body)
    .then(response => {
      res.status(201).send(response);
      console.log('Offer created successfully:', response);
    })
    .catch(error => {
      console.error('Error creating offer:', error);
    });
});
app.put('/offers/:id', (req, res) => {
  const offerId = req.params.id;
  
  if (!offerId) {
    return res.status(400).json({ error: 'Offer ID is required' });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request offer is empty' });
  }

  const offerData = { 
    
    ...req.body 
  };

  offers_model.editOfferByID(offerData)
    .then(response => {
      res.status(200).json({
        success: true,
        message: `Offer with ID ${offerId} updated successfully`,
        data: response
      });
    })
    .catch(error => {
      console.error(`Error updating offer ${offerId}:`, error);
      res.status(500).json({
        success: false,
        message: `Failed to update offer ${offerId}`,
        error: error.message
      });
    });
});
}

app.listen(port, () => {
  console.log(`Слушаю порт: ${port}.`)
})