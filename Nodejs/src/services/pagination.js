export function paginate(req) {
    const { page, size, noPagination } = req.query;

    if (noPagination === 'true') {
        return {};
    } else  {
        let limit, skip;
        skip = (page - 1) * size;
        limit = size;
        return { limit, skip };
    }
    
}

export function paginatePortraits(req, totalItems) {
    const { page, size } = req.query;

     if (page && size) {
        const limit = parseInt(size);
        const skip = (parseInt(page) - 1) * limit;
        return { limit, skip };
    } else {
        const defaultSize = totalItems;
        return { limit: defaultSize, skip: 0 };
    }
}
