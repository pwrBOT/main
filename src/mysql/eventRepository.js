const mysqlHelper = require("./mysqlHelper");

const eventGet = async (
    eventId
  ) => {
    return new Promise(resolve => {
        mysqlHelper
        .query('SELECT * FROM powerbot_events WHERE eventId=?', [eventId])
        .then((result) => {
          // GIBT DEN ERSTEN WERT DES ARRAYS ZURÜCK
          resolve(result && result.length !== 0 ? result[0] : null);
        })
        .catch(() => {
          resolve(null);
        });
    });
  };

const getAllEvents = async () => {
  return new Promise(resolve => {
      mysqlHelper
      .query('SELECT * FROM powerbot_events WHERE eventStatus=?', ["active"])
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

 
const eventAdd = async (
  eventId,
  guildId,
  channelId,
  messageId,
  host,
  eventTitle,
  eventDescription,
  eventStart,
  eventEnd
) => {
  return new Promise(resolve => {
    mysqlHelper
      .query(
        "INSERT INTO powerbot_events (eventId, guildId, channelId, messageId, host, eventTitle, eventDescription, eventStart, eventEnd, eventStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          eventId,
          guildId,
          channelId,
          messageId,
          host,
          eventTitle,
          eventDescription,
          eventStart,
          eventEnd,
          "active"
        ]
      )
      .then(result => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const eventUpdate = async (eventId, property, status) => {
  return new Promise(resolve => {
    mysqlHelper
      .query(
        `UPDATE powerbot_events SET ${property}=? WHERE eventId=?`,
        [status, eventId]
      )
      .then(result => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const eventEnd = async (eventId, guildId) => {
  return new Promise(resolve => {
    mysqlHelper
      .query(
        "UPDATE powerbot_events SET eventStatus=? WHERE eventId=? AND guildId=?",
        ["ended", eventId, guildId]
      )
      .then(result => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const addParticipant = async (eventId, guildId, memberId, memberName, status) => {
  return new Promise(resolve => {
    mysqlHelper
      .query(
        "INSERT INTO powerbot_event_paticipants (eventId, guildId, memberId, memberName, status) VALUES (?, ?, ?, ?, ?)",
        [eventId, guildId, memberId, memberName, status]
      )
      .then(result => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getAllParticipants = async (eventId, limit=-1) => {
    return new Promise((resolve) => {
      mysqlHelper
        .query('SELECT * FROM powerbot_event_paticipants WHERE eventId=? ORDER BY ID', [eventId], limit)
        .then( (result) => {
          // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
          resolve(result ?? null);
        })
        .catch(() => {
          resolve(null);
        });
    });
  }

const delParticipant = async (eventId, memberId) => {
  return new Promise(resolve => {
    mysqlHelper
      .query(
        "DELETE FROM powerbot_event_paticipants WHERE eventId=? AND memberId=?",
        [eventId, memberId]
      )
      .then(result => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const delAllParticipants = async (eventId) => {
  return new Promise(resolve => {
    mysqlHelper
      .query(
        "DELETE FROM powerbot_event_paticipants WHERE eventId=?",
        [eventId]
      )
      .then(result => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

module.exports.eventGet = eventGet;
module.exports.getAllEvents = getAllEvents;
module.exports.eventAdd = eventAdd;
module.exports.eventUpdate = eventUpdate;
module.exports.eventEnd = eventEnd;
module.exports.addParticipant = addParticipant;
module.exports.getAllParticipants = getAllParticipants;
module.exports.delParticipant = delParticipant;
module.exports.delAllParticipants = delAllParticipants;
