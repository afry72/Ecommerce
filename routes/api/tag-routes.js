const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // Find all tags including associated Product data
  Tag.findAll({
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
  .then(tags => {
    // Return the result as JSON
    res.json(tags);
  })
  .catch(error => {
    // Handle errors if any occur
    console.error('Error finding tags', error);
    res.status(500).json({ error: 'Failed to find tags' });
  });
});

router.get('/:id', (req, res) => {
  const tagId = req.params.id;

  // Find a single tag by its ID including associated Product data
  Tag.findByPk(tagId, {
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
  .then(tag => {
    if (!tag) {
      // If tag with the given ID is not found, return 404
      return res.status(404).json({ error: 'Tag not found' });
    }
    // Return the result as JSON
    res.json(tag);
  })
  .catch(error => {
    // Handle errors if any occur
    console.error('Error finding tag', error);
    res.status(500).json({ error: 'Failed to find tag' });
  });
});

router.post('/', async (req, res) => {
  try {
    // Create the tag
    const newTag = await Tag.create({
      tag_name: req.body.tag_name
    });

    // If there are products associated with the tag, create them
    if (req.body.products && req.body.products.length > 0) {
      const products = await Promise.all(req.body.products.map(async (productData) => {
        const product = await Product.create({
          ...productData,
          category_id: productData.category_id || 1 
        });
        // Associate the product with the newly created tag
        await product.addTag(newTag);
        return product;
      }));
      newTag.products = products;
    }

    // Return the newly created tag with associated products
    res.status(201).json(newTag);
  } catch (error) {
    console.error('Error creating tag with products', error);
    res.status(500).json({ error: 'Failed to create tag with products' });
  }
});

router.put('/:id', (req, res) => {
  const tagId = req.params.id;

  // Update a tag's name by its ID value
  Tag.update(req.body, {
    where: {
      id: tagId
    }
  })
  .then(updatedTag => {
    // Return the updated tag as JSON
    res.json(updatedTag);
  })
  .catch(error => {
    // Handle errors if any occur
    console.error('Error updating tag', error);
    res.status(500).json({ error: 'Failed to update tag' });
  });
});

router.delete('/:id', (req, res) => {
  const tagId = req.params.id;

  // Delete a tag by its ID value
  Tag.destroy({
    where: {
      id: tagId
    }
  })
  .then(() => {
    // Return a success message
    res.json({ message: 'Tag deleted successfully' });
  })
  .catch(error => {
    // Handle errors if any occur
    console.error('Error deleting tag', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  });
});

module.exports = router;
