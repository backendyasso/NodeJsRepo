import PortfolioModel from "../models/portfolio.model.js"
import {paginatePortraits } from "../services/pagination.js"
import mongoose from "mongoose"

export const createPortfolio = async (req, res) => {
  try {
    const { portraits } = req.body;
    if (!portraits || !Array.isArray(portraits) || portraits.length === 0) {
      return res.status(400).json({ error: 'Portraits array is required' });
    }
    const portfolio = new PortfolioModel({
      artistId: req.user._id,
      portraits: portraits.map(portrait => ({
        title: portrait.title,
        category: portrait.category,
        image: portrait.image
      }))
    });

    await portfolio.save();
    res.status(201).json({ message: 'Portfolio created successfully', portfolio });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deletePortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    if (!portfolioId) {
      return res.status(400).json({ error: 'Portfolio ID is required' });
    }
    const portfolio = await PortfolioModel.findOne({
      _id: portfolioId,
      artistId: req.user._id,
    });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found or you are not authorized to delete it' });
    }

    const deletedPortfolio = await PortfolioModel.findOneAndDelete({ _id: portfolioId });
    await PortfolioModel.deleteOne({ _id: portfolioId });

    res.json({ message: 'Portfolio deleted successfully', deletedPortfolio });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deletePortrait = async (req, res) => {
  try {
    const { portraitId } = req.params;
    if (!portraitId) {
      return res.status(400).json({ error: 'Portrait ID is required' });
    }

    const portfolio = await PortfolioModel.findOne({
      'portraits._id': portraitId,
      artistId: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found or you are not authorized to delete from it' });
    }

    const portraitIndex = portfolio.portraits.findIndex(portrait => portrait._id.toString() === portraitId);

    if (portraitIndex === -1) {
      return res.status(404).json({ error: 'Portrait not found' });
    }
    const deletedPortrait = portfolio.portraits[portraitIndex];
    portfolio.portraits.splice(portraitIndex, 1);
    await portfolio.save();
    res.json({ message: 'Portrait deleted successfully', deletedPortrait });
  } catch (error) {
    console.error('Error deleting portrait:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addToPortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const { portraits } = req.body;

    if (!portfolioId) {
      return res.status(400).json({ error: 'Portfolio ID is required' });
    }

    const portfolio = await PortfolioModel.findOne({
      _id: portfolioId,
      artistId: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found or you are not authorized to update it' });
    }

    const updates = [];

    if (portraits && Array.isArray(portraits)) {
      portraits.forEach(portrait => {
        const newPortrait = {
          title: portrait.title,
          category: portrait.category,
          image: portrait.image
        };
        portfolio.portraits.push(newPortrait);
        updates.push(newPortrait);
      });
    }
    
    await portfolio.save();

    res.json({ message: 'Portfolio updated successfully', updates });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const viewArtistPortfolio = async (req, res) => {
  try {
    const artistId = req.params.artistId; 
    const query = { artistId };
    const artist = await PortfolioModel.findOne(query);

    if(!artist) {
      res.json("Portfolio not found")
    }

    const totalItems = artist.portraits.length;

    const { limit, skip } = paginatePortraits(req, totalItems);

    const totalPortraits = totalItems;
    const portfolios = artist.portraits
      .slice(skip, skip + limit)
      .map(portrait => ({
        title: portrait.title,
        image: portrait.image,
        date: portrait.date,
        category: portrait.category
      }));

     const totalPage = Math.ceil(totalPortraits / limit)

      if (totalPage < req.query.page) {
        return res.status(400).json({ 
          message: `Requested page and size are not suitable for the number of Portraits found.`,
          portfolios,
          totalPortraits ,
         currentPage: parseInt(req.query.page) || 1,
         //totalPages: Math.ceil(totalCount / limit),
         totalPages : totalPage
        });
      }

      res.status(200).json({
        message: 'Portfolios fetched successfully',
        portfolios,
        totalPortraits ,
        currentPage: parseInt(req.query.page) || 1,
        //totalPages: Math.ceil(totalCount / limit),
        totalPages : totalPage
      });
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateSpecificPortrait = async (req, res) => {
  try {
    const { portraitId } = req.params;
    const { title, category, image } = req.body;

    const portfolio = await PortfolioModel.findOne({ "portraits._id": portraitId });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio or Portrait not found' });
    }

    const portrait = portfolio.portraits.find(p => p._id.toString() === portraitId);
    if (!portrait) {
      return res.status(404).json({ error: 'Portrait not found in the portfolio' });
    }

    if (req.user._id.toString() !== portfolio.artistId.toString()) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    if (title) {
      portrait.title = title;
    }
    if (category) {
      portrait.category = category;
    }
    if (image) {
      portrait.image = image;
    }

    await portfolio.save();

    const updatedPortrait = {
      _id: portrait._id,
      title: portrait.title,
      category: portrait.category,
      image: portrait.image
    };

    //res.json({ message: 'Portrait updated successfully', portfolio });
    res.json({ message: 'Portrait updated successfully', portrait: updatedPortrait });
  } catch (error) {
    console.error('Error updating portrait:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};