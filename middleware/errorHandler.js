const errorHandler = (err, req, res, next) => {
    
    if(err) {
        res.status(err.status ?? 400).json({
            error: err.message,
        });
    }

    next(err);
};

export default errorHandler;