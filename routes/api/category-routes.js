const router = require('express').Router();
const { Category, Product } = require('../../models');
const { update } = require('../../models/Category');

// The `/api/categories` endpoint

router.get('/', (req, res) => {
  Category.findAll({
    include: {
      model: Product,
      attributes: [
        'id',
        'product_name',
        'price',
        'stock'
      ]
    }
  })
  .then(categories => {
    // Return the result as JSON
    res.json(categories);
  })
  .catch(error => {
    // Handle errors if any occur
    console.error('Error finding categories', error);
    res.status(500).json({ error: 'Failed to find categories' });
  });
});

router.get('/:id', (req, res) => {
  const categoryId = req.params.id;

  // Find the category by ID including associated products
  Category.findByPk(categoryId, {
    include: {
      model: Product,
      attributes: [
        'id',
        'product_name',
        'price',
        'stock'
      ]
    }
  })
  .then(category => {
    if (!category) {
      // If category with the given ID is not found return 404
      return res.status(404).json({ error: 'Category not found' });
    }
    // Return the result as JSON
    res.json(category);
  })
  .catch(error => {
    // Handle errors if any occur
    console.error('Error finding category', error);
    res.status(500).json({ error: 'Failed to find category' });
  });
});

router.post('/', (req, res) => {
  const { category_name, products } = req.body;

  // Create the category first
  Category.create({ category_name })
    .then(newCategory => {
      // Check if there are products associated with the category
      if (products && products.length > 0) {
        // Create each product and associate it with the newly created category
        const productPromises = products.map(product => {
          return Product.create({
            ...product,
            category_id: newCategory.id 
          });
        });
        // Wait for all product creations to finish
        return Promise.all(productPromises)
          .then(() => newCategory); 
      }
      // If no products just return the new category
      return newCategory;
    })
    .then(newCategory => {
      // Return the newly created category as JSON
      res.json(newCategory);
    })
    .catch(error => {
      // Handle errors if any occur
      console.error('Error creating category with products', error);
      res.status(500).json({ error: 'Failed to create category with products' });
    });
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
  Category.update(req.body, {
    where: {
      id: req.params.id
    },
    individualHooks: true
  })
  .then(async () => {
    const updatedCategory = await Category.findByPk(req.params.id);
    if (!updatedCategory) {
      res.status(404).json({ message: `No category with id ${req.params.id}` });
      return;
    }
    res.status(200).json(updatedCategory);
  })
  .catch(error => {
    res.status(500).json({ error: error.message || 'Server error' });
  });
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const destCat = await Category.destroy({
      where: {
        id: req.params.id
      }
    });
    if (!destCat) {
      res.status(404).json({message: `no category with id ${req.params.id}`});
      return;
    }
    res.status(200).json({message: `deleted ${req.params.id}`})
  } catch (error) {
    res.status(500).json({error: error.message || 'server error'});
  }
});

module.exports = router;
