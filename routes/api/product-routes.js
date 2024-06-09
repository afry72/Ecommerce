const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  // Find all products including associated Category and Tag data
  Product.findAll({
    include: [
      { model: Category, attributes: ['id', 'category_name'] },
      { model: Tag, attributes: ['id', 'tag_name'], through: { attributes: [] } }
    ]
  })
  .then(products => {
    // Return the result as JSON
    res.json(products);
  })
  .catch(error => {
    // Handle errors if any occur
    console.error('Error finding products', error);
    res.status(500).json({ error: 'Failed to find products' });
  });
});

// get one product
router.get('/:id', (req, res) => {
  const productId = req.params.id;

  // Find a single product by its ID including associated Category and Tag data
  Product.findByPk(productId, {
    include: [
      { model: Category, attributes: ['id', 'category_name'] },
      { model: Tag, attributes: ['id', 'tag_name'], through: { attributes: [] } }
    ]
  })
  .then(product => {
    if (!product) {
      // If product with the given ID is not found return 404
      return res.status(404).json({ error: 'Product not found' });
    }
    // Return the result as JSON
    res.json(product);
  })
  .catch(error => {
    // Handle errors if any occur
    console.error('Error finding product', error);
    res.status(500).json({ error: 'Failed to find product' });
  });
});

// create new product
router.post('/', (req, res) => {
  Product.create(req.body)
  .then((product) => {
    // If there are product tags create pairings to bulk create in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      return ProductTag.bulkCreate(productTagIdArr);
    }
    // If no product tags just respond
    res.status(200).json(product);
  })
  .then((productTagIds) => res.status(200).json(productTagIds))
  .catch((err) => {
    console.error('Error creating product', err);
    res.status(400).json(err);
  });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  const productId = req.params.id;

  // Delete a product by its ID value
  Product.destroy({
    where: {
      id: productId
    }
  })
  .then(deletedRows => {
    if (deletedRows === 0) {
      // If no product was deleted it means the product with the given ID does not exist
      return res.status(404).json({ error: 'Product not found' });
    }
    // If the product was successfully deleted return a success message
    res.json({ message: 'Product deleted successfully' });
  })
  .catch(error => {
    // Handle errors if any occur
    console.error('Error deleting product', error);
    res.status(500).json({ error: 'Failed to delete product' });
  });
});

module.exports = router;
