const Joi = require('joi');

const NotePayloadSchema = Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).allow(null),
});

module.exports = { NotePayloadSchema };
