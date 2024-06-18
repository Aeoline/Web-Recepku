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
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

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

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
const Crud = () => {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [product, setProduct] = useState({} as any);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [radioValue, setRadioValue] = useState(product.isAdmin ? true : false);

    useEffect(() => {
        // Pengecekan token dan redirect jika tidak ada token
        const token = Cookies.get('access_token');
        if (!token) {
            router.push('/auth/login');
        }
    }, [router]);

    useEffect(() => {
        if (product && product.isAdmin !== undefined) {
          setRadioValue(product.isAdmin);
        }
      }, [product]);

    useEffect(() => {
        const config = getAuthConfig();
        if (!config) {
            return; // Jika tidak ada token, hentikan eksekusi
        }
        axios
            .get('https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/users', config)
            .then((res: any) => {
                const data = res.data.data;
                setOriginalProducts(data);
                setProducts(data); // Ganti setProduct menjadi setProducts
                console.log(data);
                const firstFood = data[0];
                console.log(firstFood.uid);
                console.log(firstFood.email);
                console.log(firstFood.username);
            })
            .catch((error: any) => {
                console.error(error);
            });
    }, []);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    };

    const openNew = () => {
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
    };

    const saveProduct = () => {
        setSubmitted(true);

        if (product.username && product.username.trim()) {
            let _products: any[] = [];
            let _product = { ...product };

            const config = getAuthConfig();
            if (!config) {
                return; // Jika tidak ada token, hentikan eksekusi
            }

            fetch(`https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/users/${product.uid}`, {
                method: 'PUT',
                headers: {
                    ...config.headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: product.username,
                    email: product.email,
                    isAdmin: radioValue
                })
            })
                .then((response) => {
                    if (response.ok) {
                        const index = findIndexById(product.uid);
                        _products[index] = _product;
                        setProductDialog(false);
                        setProduct('emptyProduct');
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Product Updated',
                            life: 3000
                        });
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
            toast.current?.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Fill all the fields',
                life: 3000
            });
        }
    };

    const editProduct = (product: Demo.Product) => {
        setProduct({ ...product });
        setProductDialog(true);
    };

    const confirmDeleteProduct = (product: Demo.Product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    const deleteProduct = () => {
        // Mengambil ID produk yang akan dihapus
        const productId : any = product.uid;
        const config = getAuthConfig();
        if (!config) {
            return; // Jika tidak ada token, hentikan eksekusi
        }

        // Mengirim permintaan DELETE ke server
        fetch(`https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/users/${productId}`, {
            method: 'DELETE',
            headers: config.headers
        })
            .then((response) => {
                if (response.ok) {
                    // Menghapus produk dari state
                    const updatedProducts = products.filter((val : any) => val.uid !== productId);
                    setProducts(updatedProducts);
                    setDeleteProductDialog(false);
                    setProduct('emptyProduct');
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'User Removed',
                        life: 3000
                    });
                } else {
                    throw new Error('Failed to remove user');
                }
            })
            .catch((error) => {
                console.log(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to remove user',
                    life: 3000
                });
            });
    };

    const findIndexById = (uid: string) => {
        let index = -1;
        for (let i = 0; i < (products as any)?.length; i++) {
            if ((products as any)[i].uid === uid) {
                index = i;
                break;
            }
        }

        return index;
    };

    const createId = () => {
        let uid = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            uid += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return uid;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true);
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
    
            const selectedUserIds = selectedProducts.map((product : any) => product.uid);
            // Mengirim permintaan DELETE ke server
            const response = await fetch(`https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/users/${selectedUserIds.join(',')}`, {
                method: 'DELETE',
                headers: config.headers
            });
    
            if (response.ok) {
                // Menghapus produk dari state
                const updatedProducts = products.filter((val : any) => !selectedUserIds.includes(val.uid));
                setProducts(updatedProducts);
                setDeleteProductDialog(false);
                setProduct('emptyProduct');
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'User Removed',
                    life: 3000
                });
            } else {
                throw new Error('Failed to remove user');
            }
        } catch (error) {
            console.log(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to remove user',
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
                    {/* <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} /> */}
                    <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !(selectedProducts as any).length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {/* <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" /> */}
                {/* <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} /> */}
            </React.Fragment>
        );
    };

    const codeBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Code</span>
                {rowData.uid}
            </>
        );
    };

    const nameBodyTemplate = (rowData: any) => {
        const nameStyle = {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px' // Sesuaikan dengan lebar maksimum yang diinginkan
        };

        return (
            <>
                <span className="p-column-title">Name</span>
                <div style={nameStyle}>{rowData.username}</div>
            </>
        );
    };

    const emailBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                <div>{rowData.email}</div>
            </>
        );
    };

    const roleBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                <div>{rowData.isAdmin === false ? 'User' : 'Admin'}</div>
            </>
        );
    };

    const actionBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editProduct(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProduct(rowData)} />
            </>
        );
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
            fetch(`https://backend-recepku-oop-rnrqe2wc3a-et.a.run.app/users`, config)
                .then((response) => response.json())
                .then((data) => {
                    if (Array.isArray(data.data)) {
                        const transformedData = data.data
                            .filter((item: any) => {
                                const username = item.username.toLowerCase();
                                return username.includes(searchInput.toLowerCase());
                            })
                            .map((item: any) => ({
                                uid: item.uid,
                                username: item.username,
                                email: item.email,
                                role: item.role
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

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Users</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={handleSearch} placeholder="Search..." />
            </span>
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveProduct} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteProduct} />
        </>
    );
    const deleteProductsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductsDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteSelectedProducts} />
        </>
    );

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
                        dataKey="uid"
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
                        {/* <Column field="uid" header="UID" sortable body={codeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column> */}
                        <Column field="username" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="email" header="Email" sortable body={emailBodyTemplate} headerStyle={{ minWidth: '20rem' }}></Column>
                        {/* <Column header="Image" body={imageBodyTemplate}></Column>
                        <Column field="price" header="Price" body={priceBodyTemplate} sortable></Column>
                        <Column field="category" header="Category" sortable body={categoryBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="rating" header="Reviews" body={ratingBodyTemplate} sortable></Column> */}
                        <Column field="isAdmin" header="Role" body={roleBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={productDialog} style={{ width: '450px' }} header="User Details" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                        {product.image && <img src={`/demo/images/product/${product.image}`} alt={product.image} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />}
                        <div className="field">
                            <label htmlFor="name">Username</label>
                            <InputText
                                readOnly
                                id="name"
                                value={product.username?.toString()}
                                onChange={(e) => onInputChange(e, 'name')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !product.username
                                })}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <InputText
                                readOnly
                                id="email"
                                value={product.email?.toString()}
                                onChange={(e) => onInputChange(e, 'name')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !product.email
                                })}
                            />
                        </div>

                        <div className="field">
                            <label className="mb-3">Role</label>
                            <div className="formgrid grid">
                                <div className="field-radiobutton col-6">
                                    <RadioButton inputId="option1" name="option" value={true} checked={radioValue === true} onChange={(e) => setRadioValue(e.value)} />
                                    <label htmlFor="option1">Admin</label>
                                </div>
                                <div className="field-radiobutton col-6">
                                    <RadioButton inputId="option2" name="option" value={false} checked={radioValue === false} onChange={(e) => setRadioValue(e.value)} />
                                    <label htmlFor="option2">User</label>
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && (
                                <span>
                                    Are you sure you want to delete <b>{product.username}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProductsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && <span>Are you sure you want to delete the selected products?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
