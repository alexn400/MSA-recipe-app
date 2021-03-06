import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/Authcontext';
import { recipe } from '../types';
import axios from 'axios'
import { useHistory } from 'react-router-dom';
import { makeStyles, Grid, Typography, Button, Select, MenuItem, IconButton, FormLabel, Tooltip } from '@material-ui/core';
import Loading from '../components/Loading/Loading';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import SearchBar from '../components/SearchBar/SearchBar';
import ArrowDropDownSharpIcon from '@material-ui/icons/ArrowDropDownSharp';
import ArrowDropUpSharpIcon from '@material-ui/icons/ArrowDropUpSharp';
import Spacer from '../components/Spacer';
import { sortByName, sortByModified, sortByCreated } from '../util/recipeSorting';
import PaginationControls from '../components/PaginationControls.tsx/PaginationControls';
import PublicRecipeCard from '../components/PublicRecipeCard/PublicRecipeCard';
enum Sort {
    name,
    modified,
    created,
}

const useStyles = makeStyles(theme => ({
    root: {
        width: '90%',
        margin: '0 5%',
        display: 'grid',
        gridTemplateRows: 'minmax(0, min-content) auto minmax(0, min-content) ',
        padding: theme.spacing(3),
        rowGap: `${theme.spacing(2)}px`,
        position: 'absolute',
        top: 0,
        bottom: 0,
        [theme.breakpoints.down('xs')]: {
            position: 'initial',
        }
    },
    controlBar: {
        display: 'flex',
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
            alignItems: 'center',

        }
    },
    controlGroup: {
        display: 'flex',
        [theme.breakpoints.down('xs')]: {
            marginBottom: theme.spacing(2)
        }
    },
    resultsContainer: {
        overflowY: 'auto',
        [theme.breakpoints.down('xs')]: {
            overflowY: 'initial',
        }
    },
    results: {
        justifyItems: 'center',
        rowGap: `${theme.spacing(2)}px`,
        columnGap: theme.spacing(2),
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        [theme.breakpoints.down('xs')]: {
            gridTemplateColumns: 'auto',
        }
    },
    pageControls: {

    },
    label: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        lineHeight: '36px',
    },
    title: {
        [theme.breakpoints.down('xs')]: {
            marginBottom: theme.spacing(1)
        }
    },
    placeholder: {
        width: '100%',
        height: '100%',
        [theme.breakpoints.up('xs')]: {
            height: 'auto'
        }
    }
}));

interface RecipeListSavedProps {

}

const RecipeListSaved = (props: RecipeListSavedProps) => {

    const classes = useStyles()

    const { state } = useContext(AuthContext)
    
    const history = useHistory()

    const [recipes, setRecipes] = useState<recipe[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const [query, setQuery] = useState<string>('')
    const [sortedList, setSortedList] = useState<recipe[]>([])
    const [sortMethod, setSortMethod] = useState<Sort>(Sort.name)
    const [sortAsc, setSortAsc] = useState<boolean>(false)
    const [startIndex, setStartIndex] = useState<number>(0)
    const [pageAmount, setPageAmount] = useState<number>(10)

    useEffect(() => {
        // Fetch users recipesv
        console.log(axios.defaults.baseURL);
        axios({
            method: 'get',
            url: '/subscriptions',
            headers: { authToken: state.token }
        }).then(({ data, ...rest }) => {
            console.log(data);
            setRecipes(data)
        }).catch((err) => {
            console.log('error!');
        }).finally(() => {
            setLoading(false)
        });
    }, [state.token])

    useEffect(() => {
        let arr: any;
        switch (sortMethod) {
            case Sort.name:
                arr = sortByName(recipes)
                break;
            case Sort.modified:
                arr = sortByModified(recipes)
                break;
            case Sort.created:
                arr = sortByCreated(recipes)
                break;
            default:
                arr = recipes
                break;
        }

        // Reverse order if needed
        if (sortAsc) {
            setSortedList(arr.reverse())
        } else {
            setSortedList(arr)
        }
    }, [recipes, sortAsc, sortMethod])

    if (loading) {
        return (<Loading />)
    }

    const filterList = (v: recipe, i: number) => {
        if(query[0] === '@'){
            if(query === '@public'){
                return v.isPublic
            } else if (query === '@private'){
                return !v.isPublic
            } else if (query.match('^@ingredient:(.*)')){
                const q = query.match('^@ingredient:(.*)')
                if(q){

                    return v.ingredients.some(e => e.toLowerCase().includes(q[1]))
                }
            }
            return true
        } else {
            return v.name.toLowerCase().includes(query)
        }
    }
 

    const showPlaceholder = () => (
        <Grid container direction={'column'} justify={'center'} spacing={2} alignItems={'center'} className={classes.placeholder}>
            <Grid item xs>
                <Typography>Looks like theres nothing here yet!</Typography>
            </Grid>
        </Grid>
    )

    return (
        <div className={classes.root}>

            <div className={classes.controlBar}><Typography className={classes.title} variant={'h4'}>Saved Recipes</Typography>
                <Spacer expand />
                <div className={classes.controlGroup}>
                    <FormLabel className={classes.label}>Results per page</FormLabel>
                    <Select
                        variant={'filled'}
                        value={pageAmount}
                        onChange={(event: React.ChangeEvent<{ value: unknown; }>) => { setPageAmount(event.target.value as number) }}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        MenuProps={{
                            anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left"
                            },
                            transformOrigin: {
                                vertical: "top",
                                horizontal: "left"
                            },
                            getContentAnchorEl: null
                        }}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                    </Select>
                </div>
                <div className={classes.controlGroup}>
                    <FormLabel className={classes.label}>Sorting</FormLabel>
                    <Select
                        variant={'filled'}
                        value={sortMethod}
                        onChange={(event: React.ChangeEvent<{ value: unknown; }>) => { setSortMethod(event.target.value as Sort) }}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        MenuProps={{
                            anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left"
                            },
                            transformOrigin: {
                                vertical: "top",
                                horizontal: "left"
                            },
                            getContentAnchorEl: null
                        }}
                    >
                        <MenuItem value={Sort.name}>Name</MenuItem>
                        <MenuItem value={Sort.created}>Date Created</MenuItem>
                        <MenuItem value={Sort.modified}>Date Modified</MenuItem>
                    </Select>
                    <Spacer gap={1} />
                    <Tooltip title={sortAsc ? 'Sort Descending' : 'Sort Ascending'}>

                        <IconButton size={'small'} onClick={() => { setSortAsc(!sortAsc) }} style={{ width: '36px' }} color={'secondary'}>{sortAsc ? <ArrowDropUpSharpIcon /> : <ArrowDropDownSharpIcon />}</IconButton>
                    </Tooltip>
                </div>
                <Spacer gap={8} />
                <SearchBar query={query} setQuery={setQuery} />
            </div>
            {sortedList.length === 0 ? showPlaceholder() :
                <div className={classes.resultsContainer}>
                    <div className={classes.results}>
                        {sortedList.length > 0 ? (
                            sortedList.filter(filterList).length > 0 ? sortedList.filter(filterList).splice(startIndex, pageAmount).map(e => (
                                <PublicRecipeCard recipe={e} />
                            )) : 'Try something else') : 'No recipes'}

                    </div>
                </div>
            }
            <div className={classes.pageControls}>
                <PaginationControls startIndex={startIndex} pageCount={pageAmount} setStartIndex={setStartIndex} totalCount={sortedList.filter((v, i) => {
                    return v.name.toLowerCase().includes(query)
                }).length} />
            </div>

        </div>
    )
}

export default RecipeListSaved