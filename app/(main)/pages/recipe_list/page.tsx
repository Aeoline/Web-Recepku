/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ProductService } from '../../../../demo/service/ProductService';
import { Demo } from '@/types';
import { firestore } from '@/utils/firebase';
import { collection, getDocs } from 'firebase/firestore/lite';
import axios from 'axios';
import { Dropdown } from 'primereact/dropdown';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Divider } from 'primereact/divider';
import { Chips } from 'primereact/chips';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import './styles.css';

type InputValue = { value: boolean; label: string };

const getAuthConfig = () => {
    const token = Cookies.get('access_token');

    if (!token) {
        console.error('No token found');
        return null;
    }

    return {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
};

const Crud = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Demo.Product[]>([]);
    const [recipeDialog, setRecipeDialog] = useState(false);
    const [deleterecipeDialog, setDeleterecipeDialog] = useState(false);
    const [deleteProductsDialog, setDeleteRecipeDialog] = useState(false);
    const [addPhotoDialog, setAddPhotoDialog] = useState(false);
    const [product, setProduct] = useState({} as any);
    const [selectedProducts, setSelectedProducts] = useState({} as any);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
    const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
    const fileUploadRef = useRef<any>(null);

    const dropdownValues = [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ];

    const [dropdownValue, setDropdownValue] = useState<InputValue | null>(null);

    useEffect(() => {
        // Pengecekan token dan redirect jika tidak ada token
        const token = Cookies.get('access_token');
        if (!token) {
            router.push('/auth/login');
        }
    }, [router]);

    useEffect(() => {
        if (product && product.isFavorite !== undefined) {
            setDropdownValue(product.isFavorite);
        }
    }, [product]);

    useEffect(() => {
        const config = getAuthConfig();
        if (!config) {
            return; // Jika tidak ada token, hentikan eksekusi useEffect ini
        }

        axios
            .get('https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/recipes', config)
            .then((res: any) => {
                const data = res.data.data;

                setOriginalProducts(data); // Save original data to state
                setProducts(data); // Save data to state
                console.log(data);
                const firstFood = data[0];
                console.log(firstFood.title);
                console.log(firstFood.description);
                console.log(firstFood.ingredients);
                console.log(firstFood.steps);

                // Set initial dropdown value based on the first product's isFavorite field
                if (firstFood) {
                    const initialOption = dropdownValues.find((option) => option.value === firstFood.isFavorite) || null;
                    setDropdownValue(initialOption);
                }
            })
            .catch((error: any) => {
                console.error(error);
            });
    }, []);

    const emptyProduct = {} as any; // Declare emptyProduct variable
    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setRecipeDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setRecipeDialog(false);
    };

    const hideDeleterecipeDialog = () => {
        setDeleterecipeDialog(false);
    };

    const hideDeleteRecipeDialog = () => {
        setDeleteRecipeDialog(false);
    };

    const handleSearch = (event: any) => {
        const searchInput = event.target.value;
        setSearchInput(searchInput);

        const config = getAuthConfig();
        if (!config) {
            return; // Jika tidak ada token, hentikan eksekusi useEffect ini
        }

        if (searchInput == '' || searchInput == null || searchInput == undefined || searchInput == ' ') {
            // Jika input pencarian kosong, perbarui products dengan data asli
            setProducts([...originalProducts]);
        } else {
            // Jika input pencarian tidak kosong, lakukan pencarian dan perbarui products dengan hasil pencarian
            fetch(`https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/recipes`, config)
                .then((response) => response.json())
                .then((data) => {
                    if (Array.isArray(data.data)) {
                        const transformedData = data.data
                            .filter((item: any) => {
                                const slugWords = item.slug.split(' ');
                                return slugWords.some((word: string) => word.toLowerCase().startsWith(searchInput.toLowerCase()));
                            })
                            .map((item: any) => ({
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                photoUrl: item.photoUrl,
                                calories: item.calories,
                                healthyCalories: item.healthyCalories,
                                ingredients: item.ingredients,
                                steps: item.steps,
                                healthyIngredients: item.healthyIngredients,
                                healthySteps: item.healthySteps,
                                isFavorite: item.isFavorite.name
                                // Tambahkan properti lain yang Anda perlukan
                                // misalnya: ingredients, steps, dll.
                            }));

                        setProducts(transformedData);
                        console.log(transformedData);
                    } else {
                        console.error('Invalid data format');
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };

    const saveProduct = () => {
        setSubmitted(true);

        // Validasi bahwa semua properti tidak kosong
        const requiredFields = ['title', 'slug', 'description', 'calories', 'healthyCalories', 'ingredients', 'healthyIngredients', 'steps', 'healthySteps', 'photoUrl'];

        // Memeriksa apakah ada field yang kosong
        const isEmptyField = requiredFields.some((field) => !product[field] || product[field].toString().trim() === '');

        if (isEmptyField) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'All fields are required',
                life: 3000
            });
            return;
        }

        let _products = Array.isArray(products) ? [...products] : [];
        let _product = { ...product, isFavorite: dropdownValue };

        const config = getAuthConfig();
        if (!config) {
            return; // Jika tidak ada token, hentikan eksekusi
        }

        if (product.id) {
            // Mengirim permintaan PUT ke server untuk memperbarui produk
            fetch(`https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/recipes/${product.id}`, {
                method: 'PUT',
                headers: config.headers,
                body: JSON.stringify(_product)
            })
                .then((response) => {
                    if (response.ok) {
                        const index = findIndexById(product.id);
                        _products[index] = _product;
                        setProducts(_products);
                        setRecipeDialog(false);
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Product Updated',
                            life: 3000
                        });
                        window.location.reload(); // Reload halaman setelah produk berhasil diperbarui
                    } else {
                        throw new Error('Failed to update product');
                    }
                })
                .catch((error) => {
                    console.log(error);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update product',
                        life: 3000
                    });
                });
        } else {
            // Mengirim permintaan POST ke server untuk membuat produk baru
            fetch('https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/recipes', {
                method: 'POST',
                headers: config.headers,
                body: JSON.stringify(_product)
            })
                .then((response) => {
                    if (response.ok) {
                        // Memperbarui data produk setelah berhasil dibuat
                        fetch('https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/recipes', config) // Mengambil semua produk dari server
                            .then((response) => response.json())
                            .then((items) => {
                                if (Array.isArray(items)) {
                                    setProducts(items);
                                } else {
                                    console.error('Fetched products are not an array:', items);
                                    setProducts([]);
                                }
                                setRecipeDialog(false);
                                toast.current?.show({
                                    severity: 'success',
                                    summary: 'Successful',
                                    detail: 'Product Created',
                                    life: 3000
                                });
                                window.location.reload(); // Reload halaman setelah produk berhasil dibuat
                            })
                            .catch((error) => {
                                console.log(error);
                                toast.current?.show({
                                    severity: 'error',
                                    summary: 'Error',
                                    detail: 'Failed to fetch products',
                                    life: 3000
                                });
                            });
                    } else {
                        throw new Error('Failed to create product');
                    }
                })
                .catch((error) => {
                    console.log(error);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create product',
                        life: 3000
                    });
                });
        }
    };

    const editRecipe = (product: Demo.Product) => {
        setProduct({ ...product });
        setRecipeDialog(true);
    };

    const confirmDeleteProduct = (product: Demo.Product) => {
        setProduct(product);
        setDeleterecipeDialog(true);
    };

    const deleteProduct = () => {
        // Mengambil ID produk yang akan dihapus
        const productId = product.id;
        const config = getAuthConfig();
        if (!config) {
            return; // Jika tidak ada token, hentikan eksekusi
        }

        // Mengirim permintaan DELETE ke server
        fetch(`https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/recipes/${productId}`, {
            method: 'DELETE',
            headers: config.headers
        })
            .then((response) => {
                if (response.ok) {
                    // Menghapus produk dari state
                    const updatedProducts = products.filter((val) => val.id !== productId);
                    setProducts(updatedProducts);
                    setDeleterecipeDialog(false);
                    setProduct(emptyProduct);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Product Deleted',
                        life: 3000
                    });
                } else {
                    throw new Error('Failed to delete product');
                }
            })
            .catch((error) => {
                console.log(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete product',
                    life: 3000
                });
            });
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (products as any)?.length; i++) {
            if ((products as any)[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteRecipeDialog(true);
    };

    const deleteSelectedProducts = async () => {
        const config = getAuthConfig();
        if (!config) {
            return; // Jika tidak ada token, hentikan eksekusi
        }

        try {
            if (!selectedProducts) {
                return; // Add null check for selectedProducts
            }

            const selectedProductsIds = selectedProducts.map((product: any) => product.id); // Menggunakan any untuk product

            // Loop through each selectedProductId and send a DELETE request for each
            const response = await fetch(`https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/recipes/${selectedProductsIds.join(',')}`, {
                method: 'DELETE',
                headers: config.headers
            });

            if (response.ok) {
                // Menghapus produk dari state
                const updatedProducts = products.filter((val: any) => !selectedProductsIds.includes(val.id));
                setProducts(updatedProducts);
                setDeleteRecipeDialog(false);
                // setProduct('emptyProduct');
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'User Removed',
                    life: 3000
                });
            } else {
                throw new Error('Failed to remove recipe');
            }
        } catch (error) {
            console.log(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to remove recipe',
                life: 3000
            });
        }
        toast.current?.show({
            severity: 'success',
            summary: 'Successful',
            detail: 'Users Deleted',
            life: 3000
        });
    };

    const onCategoryChange = (e: RadioButtonChangeEvent) => {
        let _product = { ...product };
        _product['category'] = e.value;
        setProduct(_product);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !(selectedProducts as any).length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return <React.Fragment></React.Fragment>;
    };

    const codeBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Code</span>
                {rowData.id}
            </>
        );
    };

    const isFavoriteBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Code</span>
                {rowData.isFavorite ? 'Yes' : 'No'}
            </>
        );
    };

    const nameBodyTemplate = (rowData: any) => {
        const name = rowData.title;
        const words = name.split(' ');
        const displayedWords = words.slice(0, 3).join(' '); // Gabungkan kata-kata pertama hingga ketiga dengan spasi

        return (
            <>
                <span className="p-column-title">Name</span>
                <div className="name-cell">
                    {displayedWords}
                    {words.length > 3 && (
                        <>
                            <br />
                            {words.slice(3).join(' ')}
                        </>
                    )}
                </div>
            </>
        );
    };

    const imageBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                <img src={rowData.photoUrl.toString()} alt={rowData.photoUrl.toString()} className="shadow-2" width="100" />
            </>
        );
    };

    const caloriesBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Calories</span>
                {rowData.calories}
            </>
        );
    };

    const categoryBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Healthy Calories</span>
                {rowData.healthyCalories}
            </>
        );
    };

    const ratingBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Reviews</span>
                <Rating value={rowData.rating} readOnly cancel={false} />
            </>
        );
    };

    const statusBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                <span className={`product-badge status-${rowData.inventoryStatus?.toLowerCase()}`}>{rowData.inventoryStatus}</span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editRecipe(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProduct(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Recipes</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={handleSearch} placeholder="Search..." />
            </span>
        </div>
    );
    const recipeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveProduct} />
        </>
    );
    const deleterecipeDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleterecipeDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteProduct} />
        </>
    );
    const deleteProductsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteRecipeDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteSelectedProducts} />
        </>
    );

    const handleChange = (option: InputValue | null) => {
        setDropdownValue(option);
        // Update the database with the new value
        if (option) {
            updateDatabase(option.value); // Implement this function to update your database
        }
    };

    // Mock function to demonstrate updating the database
    const updateDatabase = (value: boolean) => {
        console.log('Updating database with value:', value);
        // Implement your actual database update logic here
    };

    const onUploadPhoto = (event: any) => {
        const file = event.files[0];

        const reader = new FileReader();
        reader.onload = (e) => {
            const target = e.target as FileReader;
            if (target.result) {
                const uploadedPhotoUrl = target.result as string;
                setUploadedPhotoUrl(uploadedPhotoUrl);
                setAddPhotoDialog(true); // Tampilkan dialog konfirmasi
            }
        };
        reader.readAsDataURL(file);
    };

    const resetFileInput = () => {
        if (fileUploadRef.current) {
            fileUploadRef.current.clear(); // Reset input file
        }
    };

    const hideAddPhotoDialog = () => {
        setAddPhotoDialog(false);
        setUploadedPhotoUrl(null); // Reset state jika dialog ditutup
        resetFileInput(); // Reset input file
    };

    const confirmAddPhoto = () => {
        setProduct({ ...product, photoUrl: uploadedPhotoUrl as string });
        setAddPhotoDialog(false);
        setUploadedPhotoUrl(null); // Reset the uploadedPhotoUrl state after confirming
        resetFileInput(); // Reset input file
    };

    const addPhotoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideAddPhotoDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={confirmAddPhoto} />
        </>
    );

    const onChipsChange = (value: string[], name: string) => {
        let _product = { ...product };
        _product[name] = value;
        setProduct(_product);
    };

    const triggerFileUpload = () => {
        if (fileUploadRef.current) {
            fileUploadRef.current.fileInput.click(); // Paksa buka dialog file picker
        }
    };

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={products}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                        globalFilter={globalFilter}
                        emptyMessage="No products found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        {/* <Column field="code" header="ID" sortable body={codeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column> */}
                        <Column field="title" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column header="Image" body={imageBodyTemplate}></Column>
                        <Column field="calories" header="Calories" sortable body={caloriesBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="healthyCalories" header="Healthy Calories" sortable body={categoryBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="isFavorite" header="Is Recommended" body={isFavoriteBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={recipeDialog} style={{ width: '450px' }} header="Recipe Details" modal className="p-fluid" footer={recipeDialogFooter} onHide={hideDialog}>
                        <label htmlFor="name">Photo</label>
                        <div className="grid">
                            <div className="col-5 flex align-items-center justify-content-center">
                                <div className="p-fluid">
                                    <div className="field">{product.photoUrl && <img src={product.photoUrl} alt="Uploaded" width="150" className="mt-0 mx-auto mb-5 block shadow-2" />}</div>
                                </div>
                            </div>
                            <div className="col-1">
                                <Divider layout="vertical"></Divider>
                            </div>
                            <div className="col-5 items-center justify-center">
                                <FileUpload
                                    ref={fileUploadRef} // Tambahkan ref ke FileUpload
                                    id="photo"
                                    name="photo"
                                    mode="basic"
                                    accept="image/*"
                                    chooseLabel="Upload"
                                    customUpload
                                    auto
                                    uploadHandler={onUploadPhoto}
                                    className={classNames({
                                        'p-invalid': submitted && !product.photoUrl
                                    })}
                                />
                               
                                <Divider layout="horizontal" align="center">
                                    <b>OR</b>
                                </Divider>
                                <div className="field">
                                    <label htmlFor="photoUrl">PhotoUrl</label>
                                    <InputText
                                        id="photoUrl"
                                        value={product.photoUrl || ''}
                                        onChange={(e) => setProduct({ ...product, photoUrl: e.target.value })}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !product.photoUrl
                                        })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="name">Name</label>
                            <InputText
                                id="name"
                                value={product.title?.toString() ?? ''}
                                onChange={(e) => onInputChange(e, 'title')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !product.title
                                })}
                            />
                            {submitted && !product.title && <small className="p-invalid">Name is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="slug">Slug</label>
                            <InputText
                                id="slug"
                                value={product.slug?.toString() ?? ''}
                                onChange={(e) => onInputChange(e, 'slug')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !product.slug
                                })}
                            />
                            {submitted && !product.slug && <small className="p-invalid">Slug is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="description">Description</label>
                            <InputTextarea
                                id="description"
                                value={product.description}
                                onChange={(e) => onInputChange(e, 'description')}
                                required
                                rows={3}
                                cols={20}
                                className={classNames({
                                    'p-invalid': submitted && !product.description
                                })}
                            />
                            {submitted && !product.description && <small className="p-invalid">Description is required.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="isFavorite">Is Recommended</label>
                            <Dropdown
                                id="isFavorite"
                                value={dropdownValue}
                                onChange={(e) => handleChange(e.value)}
                                options={dropdownValues}
                                optionLabel="label"
                                placeholder="Select"
                                className={classNames({
                                    'p-invalid': submitted && dropdownValue === null
                                })}
                            />
                            {submitted && dropdownValue === null && !product.isFavorite && <small className="p-invalid">This Field is required.</small>}
                        </div>

                        <h5>Normal Recipe</h5>
                        <div className="field">
                            <label htmlFor="calories">Calories</label>
                            <InputText
                                id="calories"
                                value={product.calories}
                                onChange={(e) => onInputChange(e, 'calories')}
                                className={classNames({
                                    'p-invalid': submitted && !product.calories
                                })}
                            />
                            {submitted && !product.calories && <small className="p-invalid">Calories is required.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="ingredients">Ingredients</label>
                            <Chips
                                id="ingredients"
                                value={product.ingredients}
                                onChange={(e) => {
                                    const value = e.value ?? [];
                                    onChipsChange(value, 'ingredients');
                                }}
                                required
                                className={classNames({
                                    'p-invalid': submitted && (!product.ingredients || product.ingredients.length === 0),
                                    'custom-chips': true
                                })}
                            />
                            {submitted && (!product.ingredients || product.ingredients.length === 0) && <small className="p-invalid">Ingredients is required.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="steps">Steps</label>
                            <Chips
                                id="steps"
                                value={product.steps}
                                onChange={(e) => {
                                    const value = e.value ?? [];
                                    onChipsChange(value, 'steps');
                                }}
                                required
                                className={classNames({
                                    'p-invalid': submitted && (!product.steps || product.steps.length === 0),
                                    'custom-chips': true
                                })}
                            />
                            {submitted && !product.steps && product.steps?.length === 0 && <small className="p-invalid">Steps is required.</small>}
                        </div>

                        <h5>Healthy Recipe</h5>
                        <div className="field">
                            <label htmlFor="healthyCalories">Calories</label>
                            <InputText
                                id="healthyCalories"
                                value={product.healthyCalories}
                                onChange={(e) => onInputChange(e, 'healthyCalories')}
                                className={classNames({
                                    'p-invalid': submitted && !product.healthyCalories
                                })}
                            />
                            {submitted && !product.healthyCalories && <small className="p-invalid">Calories is required.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="healthyIngredients">Ingredients</label>
                            <Chips
                                id="healthyIngredients"
                                value={product.healthyIngredients}
                                onChange={(e) => {
                                    const value = e.value ?? [];
                                    onChipsChange(value, 'healthyIngredients');
                                }}
                                required
                                className={classNames({
                                    'p-invalid': submitted && (!product.healthyIngredients || product.healthyIngredients.length === 0),
                                    'custom-chips': true
                                })}
                            />
                            {submitted && !product.healthyIngredients && product.healthyIngredients?.length === 0 && <small className="p-invalid">Ingredients is required.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="healthySteps">Steps</label>
                            <Chips
                                id="healthySteps"
                                value={product.healthySteps}
                                onChange={(e) => {
                                    const value = e.value ?? [];
                                    onChipsChange(value, 'healthySteps');
                                }}
                                required
                                className={classNames({
                                    'p-invalid': submitted && (!product.healthySteps || product.healthySteps.length === 0),
                                    'custom-chips': true
                                })}
                            />
                            {submitted && !product.healthySteps && product.healthySteps?.length === 0 && <small className="p-invalid">Steps is required.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleterecipeDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleterecipeDialogFooter} onHide={hideDeleterecipeDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && (
                                <span>
                                    Are you sure you want to delete <b>{product.title}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProductsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductsDialogFooter} onHide={hideDeleteRecipeDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && <span>Are you sure you want to delete the selected products?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={addPhotoDialog} style={{ width: '450px' }} header="Confirm" modal footer={addPhotoDialogFooter} onHide={hideAddPhotoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && <span>Are you sure you want to use this photo?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
